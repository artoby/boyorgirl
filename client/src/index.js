import React from 'react';
import ReactDOM from 'react-dom';
import Button from 'react-bootstrap/Button'
import 'holderjs'
import 'bootstrap/dist/css/bootstrap.min.css';
import { API_ROOT } from './api-config';
import SocialFollow from "./SocialFollow";

import './index.css';

const CLASS_BOY = "boys"
// const CLASS_GIRL = "girls"

class PredictForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fileLocalURL: null,
      error: null,
      isProcessing: false,
      prediction: null,
      feedbackVisible: false,
      predictedCorrect: null
    };
  }

  componentWillMount() {
    document.title = 'Boy or Girl?'
  }

  render() {
    let image_src = (this.state.fileLocalURL != null)
      ? this.state.fileLocalURL
      : "holder.js/200x200?auto=yes&text=↑Choose%20File%20to%20start↑"

    return (
      <div class="container">
        <div class="content">
          <h2 align="center">Check if baby <span class="boy">boy</span> or <span class="girl">girl</span> on the photo</h2>

          <div align="center">
            <input type="file" id="file" onChange={(event) => this.onImageSelect(event)} />
            <label for="file">Choose File</label>
          </div>

          <div class="overlay-image">
            <img src={image_src} alt="baby" />
            {this.renderImageOverlay()}
          </div>

          {this.renderError()}

          {this.renderFeedback()}

          <SocialFollow />

        </div>

      </div>
    );
  }

  renderImageOverlay() {
    if (this.state.isProcessing) {
      return (
        <div class="text overlay-back">Processing...</div>
      )
    } else if (this.state.prediction != null) {
      let prediction = this.state.prediction
      let spanClass = (prediction["predicted_class"] === CLASS_BOY)
        ? "boy"
        : "girl"
      let text = ""
      text += (prediction["predicted_class"] === CLASS_BOY)
        ? "Boy"
        : "Girl"
      text += " " + Math.round(prediction["probability"] * 100) + "%"

      return (
        <div class="text overlay-back"><p class={spanClass}>{text}<br />©AI</p></div>
      )
    }
  }

  renderError() {
    if (this.state.error != null) {
      return (
        <div>
          <label>{this.state.error}</label>
        </div>
      )
    }
  }

  renderFeedback() {
    if (this.state.feedbackVisible) {
      let yesStyle, noStyle
      if (this.state.predictedCorrect == null) {
        yesStyle = noStyle = "toggle"
      } else if (this.state.predictedCorrect) {
        yesStyle = "toggleOn"
        noStyle = "toggleOff"
      } else {
        yesStyle = "toggleOff"
        noStyle = "toggleOn"
      }

      return (
        <div align="center">
          <h3>Is it correct?</h3>
          <div>
            <Button className={yesStyle} variant="success" onClick={() => this.onFeedbackClicked(true)}>Yes</Button>
            <Button className={noStyle} variant="danger" onClick={() => this.onFeedbackClicked(false)}>No</Button>
          </div>
        </div>
      )
    }
  }

  responseText(response) {
    return Promise.all([response, response.text()])
  }

  responseLog([response, text]) {
    console.log("Response received: " + text)
    return [response, text]
  }

  responseCheckError([response, text]) {
    if (!response.ok) {
      throw Error(response.status + " " + response.statusText);
    }
    return [response, text]
  }

  responseJSON([response, text]) {
    let json = JSON.parse(text)
    return [response, json]
  }

  onFeedbackClicked(isCorrect) {
    // Update state
    this.setState({
      predictedCorrect: isCorrect
    })

    // Send feedback to backend
    fetch(`${API_ROOT}/feedback`, {
      method: 'POST',
      // headers: {'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_id: this.state.prediction["image_id"],
        is_correct: isCorrect
      }),
    })
      .then(this.responseText)
      .then(this.responseLog)
      .then(this.responseCheckError)
      .catch(error => {
        console.log(error)
      }
      )
  }

  onImageSelect(event) {
    let file = event.target.files[0]
    // If any file was selected at all
    if (file != null) {
      this.setState({
        fileLocalURL: URL.createObjectURL(file)
      });
      this.sendPredictRequest(file)
    }
  }

  setPrediction(prediction) {
    this.setState({
      prediction: prediction
    })

    // Show feedback panel
    this.setState({
      feedbackVisible: true
    })
  }

  setError(newError) {
    this.setState({
      error: newError
    })
  }

  setProcessing(isProcessing) {
    this.setState({
      isProcessing: isProcessing,
    })
  }

  sendPredictRequest(file) {
    // Send file for prediction
    const formData = new FormData();
    formData.append('image', file);

    this.setProcessing(true)

    // Reset state
    this.setState({
      feedbackVisible: false,
      predictedCorrect: null,
      prediction: null,
      error: null,
    })

    fetch(`${API_ROOT}/predict`, {
      // content-type header should not be specified!
      method: 'POST',
      body: formData,
    })
      .then(this.responseText)
      .then(this.responseLog)
      .then(this.responseCheckError)
      .then(this.responseJSON)
      .then(([response, json]) => {
        this.setPrediction(json)
      })
      .catch(error => {
        console.log(error)
        this.setError(error.toString())
      })
      .finally(() => {
        this.setProcessing(false)
      })



  }

  onChangeHandler = event => {
    console.log(event.target.files[0])

  }
}

// ========================================

ReactDOM.render(
  <PredictForm />,
  document.getElementById('root')
);
