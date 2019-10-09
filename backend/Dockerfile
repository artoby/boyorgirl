FROM bog_base:1
WORKDIR /app
ADD src ./src
ADD ai_models ./ai_models
ADD deployment ./deployment
RUN pip3 install -r ./deployment/requirements.txt
WORKDIR src

CMD [ "python", "./main.py" ]
