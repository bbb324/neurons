import React, { Component } from 'react';
import Modal from 'react-modal';
import languages from '../../languages';
import tapOrClick from '../../utils/tapOrClick';
//import wifiServerStore from '../../stores/wifiServerStore.js';
//import wifiStore from '../../stores/wifiStore.js';
//import UIActions from '../../actions/UIActions';
import MicroCognitiveStore from '../../stores/MicroCognitiveStore';
import Events from '../../constants/Events';

require('./MicrosoftCognitiveGuidance.less');


class MicrosoftCognitiveGuidance extends Component {
  constructor() {
    super(...arguments);

    this.state = {
      modalIsOpen: false,
      stepIndex: 0 //values can be 0,1,2,3,4,5
    };

    this.openDialog = this.openDialog.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.renderImageSectionNodes = this.renderImageSectionNodes.bind(this);
    this.tapBackFn = this.tapBackFn.bind(this);
    this.tapNextFn = this.tapNextFn.bind(this);
    this.renderButtonNodes = this.renderButtonNodes.bind(this);
  }

  openDialog() {
    this.setState({
      modalIsOpen: true
    });
  }

  closeDialog() {
    this.setState({
      modalIsOpen: false,
      stepIndex: 0
    });
  }

  renderImageSectionNodes() {
    let stepIndex = this.state.stepIndex;
    switch (stepIndex) {
    case 0:
      return (
        <div className="image-section">
          <img className="arrow" src="img/micro-arrow-one.png" alt=""/>
          <span className="title">{languages.getTranslation('cognitive-guidance-first')}</span>
          <img  className="guidance-image" src="img/micro-cognitive-first.png" alt=""/>
        </div>
      );
    case 1:
      return (
        <div className="image-section">
          <img className="arrow" src="img/micro-arrow-two.png" alt=""/>
          <span className="title">{languages.getTranslation('cognitive-guidance-second')}</span>
          <img  className="guidance-image" src="img/micro-cognitive-second.png" alt=""/>
        </div>
      );
    case 2:
      return (
        <div className="image-section">
          <img className="arrow" src="img/micro-arrow-three.png" alt=""/>
          <span className="title">{languages.getTranslation('cognitive-guidance-third')}</span>
          <img  className="guidance-image" src="img/micro-cognitive-third.png" alt=""/>
        </div>
      );
    case 3:
      return (
        <div className="image-section">
          <img className="arrow" src="img/micro-arrow-four.png" alt=""/>
          <span className="title">{languages.getTranslation('cognitive-guidance-fourth')}</span>
          <img  className="guidance-image" src="img/micro-cognitive-fourth.png" alt=""/>
        </div>
      );
    case 4:
      return (
        <div className="image-section">
          <img className="arrow" src="img/micro-arrow-five.png" alt=""/>
          <span className="title">{languages.getTranslation('cognitive-guidance-fifth')}</span>
          <img  className="guidance-image" src="img/micro-cognitive-fifth.png" alt=""/>
        </div>
      );
    case 5:
      return (
        <div className="image-section">
          <img className="arrow" src="img/micro-arrow-six.png" alt=""/>
          <span className="title">{languages.getTranslation('cognitive-guidance-sixth')}</span>
          <img  className="guidance-image" src="img/micro-cognitive-sixth.png" alt=""/>
        </div>
      );
    case 6:
      return (
        <div className="image-section">
          <span className="title">{languages.getTranslation('paste-and-configure')}</span>
          <img  className="guidance-image" src="img/micro-cognitive-seventh.png" alt=""/>
        </div>
      );
    default:
      break;
    }
  }

  tapBackFn() {
    let stepIndex = this.state.stepIndex;
    this.setState({
      stepIndex: --stepIndex
    });
  }

  tapNextFn() {
    let stepIndex = this.state.stepIndex;
    this.setState({
      stepIndex: ++stepIndex
    });
  }

  renderButtonNodes () {
    let stepIndex = this.state.stepIndex;
    switch (stepIndex) {
    case 0:
      return(
        <div className="button-section">
          <span className="first-button" {...tapOrClick(this.closeDialog)}>{languages.getTranslation('i-get-it')}</span>
          <span className="second-button" {...tapOrClick(this.tapNextFn)}>{languages.getTranslation('next')}</span>
        </div>
      );
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
      return(
        <div className="button-section">
          <span className="first-button" {...tapOrClick(this.tapBackFn)}>{languages.getTranslation('back')}</span>
          <span className="second-button" {...tapOrClick(this.tapNextFn)}>{languages.getTranslation('next')}</span>
        </div>
      );
    case 6:
      return(
        <div className="button-section">
          <span className="first-button" {...tapOrClick(this.tapBackFn)}>{languages.getTranslation('back')}</span>
          <span className="second-button" {...tapOrClick(this.closeDialog)}>{languages.getTranslation('i-get-it')}</span>
        </div>
      );
    default:
      break;
    }
  }

  render() {
    return (<Modal
      contentLabel="micro-cognitive-dialog"
      isOpen={this.state.modalIsOpen}
      className="micro-cognitive-guidance-dialog dialog"
      shouldCloseOnOverlayClick={true}
      overlayClassName="dialog-overlay">
      <div className="micro-cognitive-guidance-con">
        {this.renderImageSectionNodes()}
        {this.renderButtonNodes()}
        <img className="close-button" src="img/icon-closeBtn.png" alt="" {...tapOrClick(this.closeDialog)}/>
      </div>
    </Modal>);
  }

  componentDidMount() {
    MicroCognitiveStore.on(Events.OPEN_MICRO_COGNITIVE_GUIDANCE, this.openDialog);
  }

  componentWillUnmount() {
    MicroCognitiveStore.off(Events.OPEN_MICRO_COGNITIVE_GUIDANCE, this.openDialog);

  }
}

export {MicrosoftCognitiveGuidance};
