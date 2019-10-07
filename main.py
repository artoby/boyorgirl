# from starlette.applications import Starlette
from starlette.routing import Router, Mount
from starlette.staticfiles import StaticFiles
from starlette.responses import JSONResponse
from starlette.templating import Jinja2Templates
import uvicorn
from fastai.vision import load_learner, open_image


templates = Jinja2Templates(directory='templates')

learn = load_learner("ai_models")

# app = Starlette(debug=True)
app = Router(routes=[
    # Mount('/static', app=StaticFiles(directory='static'), name="static"),
])

@app.route('/api/hello_world')
async def homepage(request):
    return JSONResponse({'hello': 'world'})

@app.route('/api/predict')
async def homepage(request):
    img = open_image("images/IMG_1022.jpg")
    # img = open_image("images/IMG_1168_girlish.jpg")
    pred_class, pred_idx, outputs = learn.predict(img)
    probability = outputs[pred_idx].item()

    return JSONResponse({
        'category': str(pred_class),
        'probability': probability})

@app.route('/')
async def homepage(request):
    return templates.TemplateResponse('index.html', {'request': request})

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8000)