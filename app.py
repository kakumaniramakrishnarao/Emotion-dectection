from flask import Flask, jsonify, make_response, render_template, request, send_file
import librosa
import pickle
import numpy as np

app=Flask(__name__,static_url_path="",static_folder="./static")


f = open("./models/randomforest.pkl","rb")
rfmodel = pickle.load(f)

classes = ["anger", "disgust", "fear", "happiness", "surprise", "sadness","neutral"]

def extract_features(data):
    result = np.array([])
    zcr = np.mean(librosa.feature.zero_crossing_rate(y=data).T, axis=0)
    result=np.hstack((result, zcr))

    stft = np.abs(librosa.stft(data))
    chroma_stft = np.mean(librosa.feature.chroma_stft(S=stft).T, axis=0)
    result = np.hstack((result, chroma_stft))

    mfcc = np.mean(librosa.feature.mfcc(y=data).T, axis=0)
    result = np.hstack((result, mfcc))

    rms = np.mean(librosa.feature.rms(y=data).T, axis=0)
    result = np.hstack((result, rms))

    mel = np.mean(librosa.feature.melspectrogram(y=data).T, axis=0)
    result = np.hstack((result, mel))
    
    return result


def predict_class(path):
  au,_ = librosa.load(path)
  au = extract_features(au)
  au = np.expand_dims(au,0)
  predict = rfmodel.predict(au)[0]
  print(predict)
  return classes[predict]


@app.route('/')
def home():
    return send_file('./templates/index.html', mimetype='text/html')

@app.route('/data', methods=["GET", "POST"])
def index():
    if request.method == "POST":
        file = request.files['file']
        class_found = predict_class(file)

        return {
            'ok' : True,
            'response': class_found
        }


if __name__=='__main__':
    app.run(debug=True)