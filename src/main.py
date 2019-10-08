import os
import io
import json
import hashlib
from PIL import Image
from http import HTTPStatus
from pathlib import Path
from starlette.routing import Router, Mount
from starlette.responses import JSONResponse
from starlette.templating import Jinja2Templates
from starlette.applications import Starlette
from starlette.middleware.cors import CORSMiddleware
import uvicorn
from fastai.vision import load_learner, open_image, pil2tensor

# Resnet image size, incoming images will be reduced to this size (or remained current size if <max)
max_image_size = 224
workdir = Path("..")
uploads_path = workdir/'uploads'
ai_models_path = workdir/'ai_models'

templates = Jinja2Templates(directory=str(workdir/'templates'))

# ensure "uploads" folder
if not os.path.exists(uploads_path):
    os.mkdir(uploads_path)

# Load prediction model
learn = load_learner(ai_models_path)

app = Starlette()
app.add_middleware(CORSMiddleware, allow_origins=['http://localhost:3000',
                                                  'http://boyorgirl.artoby.me',
                                                  'https://boyorgirl.artoby.me'])

@app.route('/api/hello_world')
async def homepage(request):
    return JSONResponse({'hello': 'world'})

@app.route(path='/api/predict', methods=['POST'])
async def predict(request):
    form = await request.form()
    if "image" not in form:
        return JSONResponse({"error": "Request should contain 'image' form field"},
                            status_code=HTTPStatus.BAD_REQUEST)
    file_contents = await form["image"].read()
    h = hashlib.new('md5')
    h.update(file_contents)
    image_id = h.hexdigest()
    image_path = uploads_path/(image_id + '.jpg')
    metadata_path = uploads_path/(image_id + '.json')

    # PIL
    image = Image.open(io.BytesIO(file_contents))
    size = image.size

    # Resize if too big
    if max(size[0], size[1], max_image_size) > max_image_size:
        downscale_factor = float(max_image_size) / max(size)
        new_size = (int(round(size[0] * downscale_factor)), int(round(size[1] * downscale_factor)))
        image = image.resize(new_size, Image.LANCZOS)

    # Convert to RGB if not RGBв
    if image.mode != "RGB":
        image = image.convert(mode="RGB")

    # Save image in uploads
    # Dont' reduce quality to improve future learning capabilities

    image.save(image_path, "JPEG", quality=100, optimize=True, progressive=True)

    # Load image in the format fastai expects
    image_fastai = open_image(image_path)
    predicted_class, predicted_idx, outputs = learn.predict(image_fastai)

    # Convert from fastai category to string
    predicted_class = str(predicted_class)
    probability = outputs[predicted_idx].item()

    # Save prediction to
    metadata = {"predicted_class": predicted_class,
                "probability": probability}
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, sort_keys=True, indent=2)

    return JSONResponse({
        'image_id': image_id,
        'predicted_class': predicted_class,
        'probability': probability})

@app.route(path='/api/feedback', methods=['POST'])
async def feedback(request):
    r = await request.json()

    if "image_id" not in r:
        return JSONResponse({"error": "Request should contain 'image_id'"}, status_code=HTTPStatus.BAD_REQUEST)
    image_id = r["image_id"]

    if "is_correct" not in r:
        return JSONResponse({"error": "Request should contain 'is_correct'"}, status_code=HTTPStatus.BAD_REQUEST)
    is_correct = r["is_correct"]

    metadata_path = uploads_path/(image_id + '.json')
    metadata = { }
    if os.path.isfile(metadata_path):
        with open(metadata_path, "r") as f:
            metadata = json.load(f)

    metadata["is_correct"] = is_correct
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, sort_keys=True, indent=2)

    return JSONResponse({}, status_code=HTTPStatus.OK)

@app.route('/')
async def homepage(request):
    return templates.TemplateResponse('index.html', {'request': request})

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=3100)