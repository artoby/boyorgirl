import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Image from 'react-bootstrap/Image'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Button from 'react-bootstrap/Button'
// import Col from 'react-bootstrap/Col'
import Navbar from 'react-bootstrap/Navbar'
import 'holderjs'
import 'bootstrap/dist/css/bootstrap.min.css';
import { API_ROOT } from './api-config';

class PredictForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fileLocalURL: null,
      status: null,
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
      : "holder.js/200x200?auto=yes&text=↓Choose%20File%20to%20start↓"

    return (
      <Container>
        <Navbar bg="light" expand="lg">
          <Navbar.Brand href="#home">Check if baby boy or girl on the photo</Navbar.Brand>
        </Navbar>

        <Row>
          <Image src={image_src} style={{ height: "200px" }} />
        </Row>

        {this.renderStatus()}
        {this.renderFeedback()}

        <Row>
          <input
            type="file"
            onChange={(event) => this.onImageSelect(event)} />
        </Row>
      </Container>

    );
  }

  renderStatus() {
    if (this.state.status != null) {
      return (
        <Row>
          <label>{this.state.status}</label>
        </Row>
      )
    }
    else {
      return
    }
  }

  renderFeedback() {
    if (this.state.feedbackVisible) {
      let defaultStyle = { width: "60px", height: "30px" }
      let selectedStyle = { width: "80px", height: "40px" }
      let yesStyle = (this.state.predictedCorrect === true)
        ? selectedStyle
        : defaultStyle
      let noStyle = (this.state.predictedCorrect === false)
        ? selectedStyle
        : defaultStyle

      return (
        <Row>
          <label>Is it correct?</label>
          <Button variant="outline-success" style={yesStyle} onClick={() => this.onFeedbackClicked(true)}>Yes</Button>
          <Button variant="outline-danger" style={noStyle} onClick={() => this.onFeedbackClicked(false)}>No</Button>
        </Row>
      )
    }
    else {
      return
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
      // headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_id: this.state.prediction["image_id"],
        is_correct: isCorrect
      }),
    })
      .then(this.responseText)
      .then(this.responseLog)
      .then(this.responseCheckError)
      .catch (error => {
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

    // Upldate status
    let newStatus = prediction["predicted_class"]
      + ", "
      + Math.round(prediction["probability"] * 100) + "%"
    this.setStatus(newStatus)

    // Show feedback panel
    this.setState({
      feedbackVisible: true
    })
  }

  onNewFileSubmitted() {
    // Update status
    this.setStatus("Processing file...")
    // Reset feedback
    this.setState({
      feedbackVisible: false,
      predictedCorrect: null
    })
  }

  setStatus(newStatus) {
    this.setState({
      status: newStatus
    })
  }

  sendPredictRequest(file) {
    // Send file for prediction
    const formData = new FormData();
    formData.append('image', file);

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
        this.setStatus(error.toString())
      }
      )

    // Switch UI state on file submitted
    this.onNewFileSubmitted()
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
