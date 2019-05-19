/**
 * Created by KongyunWu on 2017/5/8.
 */
import React, { Component } from 'react';
import Modal from 'react-modal';
import languages from '../../languages';
import tapOrClick from '../../utils/tapOrClick';
//import wifiServerStore from '../../stores/wifiServerStore.js';
//import wifiStore from '../../stores/wifiStore.js';
import UIActions from '../../actions/UIActions';
import MicroCognitiveStore from '../../stores/MicroCognitiveStore';
import Events from '../../constants/Events';
import ErrorCode from '../../constants/ErrorCode';
import {setElementStyleShrink} from  '../../utils/dom';
//import {getDriverType} from '../../core/FlowEngine';

require('./MicrosoftCognitive.less');

const microCognitiveURL = {
  computerVision: 'https://azure.microsoft.com/en-us/services/cognitive-services/computer-vision/',
  emotion: 'https://azure.microsoft.com/en-us/services/cognitive-services/emotion/',
  bingSpeech: 'https://azure.microsoft.com/en-us/services/cognitive-services/speech/'
};

class MicrosoftCognitive extends Component {
  constructor() {
    super(...arguments);
    this.requestStatusList = {
      initial: 'initial',
      loading: 'loading',
      finished: 'finished'
    };

    //self set
    this.responseResultList = {
      start: 1,
      success: 0,
      fail: -100
    };

    this.isSendRequest = true;

    this.isNotComputerVisionSend = true;
    this.isNotEmotionSend = true;
    this.isNotBingSpeechSend = true;

    this.state = {
      modalIsOpen: false,
      computeVisionReqStatus: this.requestStatusList.initial,
      computeVisionRepResult: this.responseResultList.start,
      emotionReqStatus: this.requestStatusList.initial,
      emotionRepResult: this.responseResultList.start,
      bingSpeechReqStatus: this.requestStatusList.initial,
      bingSpeechRepResult: this.responseResultList.start,
    };

    this.openDialog = this.openDialog.bind(this);
    this.hideKyeBoard = this.hideKyeBoard.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.openBrowser = this.openBrowser.bind(this);
    this._showRequestStatusNodes = this._showRequestStatusNodes.bind(this);
    this.ComputerVisionRepChange = this.ComputerVisionRepChange.bind(this);
    this.emotionRepChange = this.emotionRepChange.bind(this);
    this.bingSpeechRepChange = this.bingSpeechRepChange.bind(this);
    this.clearInputText = this.clearInputText.bind(this);
    this.setInitReqStatus = this.setInitReqStatus.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
    this.setStyleCallback = this.setStyleCallback.bind(this);
    this.computeVisionRepCallback = this.computeVisionRepCallback.bind(this);
    this.emotionRepCallback = this.emotionRepCallback.bind(this);
    this.bingSpeechRepCallback = this.bingSpeechRepCallback.bind(this);
    this.openMicroCognitiveGuidanceDialog = this.openMicroCognitiveGuidanceDialog.bind(this);
  }

  openDialog() {
    this.setInitReqStatus();
    setTimeout(()=>{
      setElementStyleShrink(this.refs.microCognitiveDialog);
    }, 0);
  }

  hideKyeBoard() {
    console.log('hideKyeBoard');
    let inputs = this.refs.microCognitiveDialog.querySelectorAll('input');
    for (let i=0; i<inputs.length; i++) {
      inputs[i].blur();
    }
  }
  
  closeDialog() {
    this.hideKyeBoard();
    this.setState({
      modalIsOpen: false,
      computeVisionReqStatus: this.requestStatusList.initial,
      computeVisionRepResult: this.responseResultList.start,
      emotionReqStatus: this.requestStatusList.initial,
      emotionRepResult: this.responseResultList.start,
      bingSpeechReqStatus: this.requestStatusList.initial,
      bingSpeechRepResult: this.responseResultList.start,
    });
  }

  openBrowser(e) {
    e.preventDefault();
    let target = e.target;
    if(target.closest('.field-tpl.computer-vision')) {
      window.open(microCognitiveURL.computerVision, '_system', '');
    }
    else if(target.closest('.field-tpl.emotion')) {
      window.open(microCognitiveURL.emotion, '_system', '');
    }
    else if(target.closest('.field-tpl.bing-speech')) {
      window.open(microCognitiveURL.bingSpeech, '_system', '');
    }
  }

  _showRequestStatusNodes(reqStatus, repResult, callback) {
    switch (reqStatus) {
    case this.requestStatusList.initial:
      return (
        <span className="initial-text" {...tapOrClick(this.openBrowser)}>{languages.getTranslation('cognitive-link')}</span>
      );
    case this.requestStatusList.loading:
      return (
        <div className="loading"><span></span><span></span><span></span></div>
      );
    case this.requestStatusList.finished:
      if(repResult === this.responseResultList.success) {
        callback && callback();
        return (
          <img src="img/icon-update-done.png" alt=""/>
        );
      }else if(repResult === this.responseResultList.fail) {
        callback && callback();
        return (
          <img src="img/update-server-failed.png" alt=""/>
        );
      }
      break;
    default:
      break;
    }
  }

  ComputerVisionRepChange() {
    let reqStatus = this.state.computeVisionReqStatus;
    let repResult = this.state.computeVisionRepResult;
    let self = this;
    function _callback() {
      if(repResult === self.responseResultList.success) {
        setTimeout(function () {
          self.refs.computerVisionInput.value = localStorage.getItem('microCognitiveComputerVision');
          self.refs.computerVisionInput.setAttribute('disabled', true);
        }, 0);
      }
      if(repResult === self.responseResultList.fail) {
        setTimeout(function () {
          self.refs.computerVisionWrap.querySelector('.clear-icon').style.display = 'block';
        }, 0);

      }
    }
    return(
      <div className="status-section" ref="requestStatusSection">{this._showRequestStatusNodes(reqStatus, repResult, _callback)}</div>
    );
  }

  emotionRepChange() {
    let reqStatus = this.state.emotionReqStatus;
    let repResult = this.state.emotionRepResult;
    let self = this;
    function _callback() {
      if(repResult === self.responseResultList.success) {
        setTimeout(function () {
          self.refs.emotionInput.value = localStorage.getItem('microCognitiveEmotion');
          self.refs.emotionInput.setAttribute('disabled', true);
        }, 0);

      }
      if(repResult === self.responseResultList.fail) {
        setTimeout(function () {
          self.refs.emotionWrap.querySelector('.clear-icon').style.display = 'block';
        }, 0);

      }
    }
    return (
      <div className="status-section" ref="requestStatusSection">{this._showRequestStatusNodes(reqStatus, repResult, _callback)}</div>
    );
  }

  bingSpeechRepChange() {
    let reqStatus = this.state.bingSpeechReqStatus;
    let repResult = this.state.bingSpeechRepResult;
    let self = this;
    function _callback() {
      if(repResult === self.responseResultList.success) {
        setTimeout(function () {
          self.refs.bingSpeechInput.value = localStorage.getItem('microCognitiveBingSpeech');
          self.refs.bingSpeechInput.setAttribute('disabled', true);
        }, 0);
      }
      if(repResult === self.responseResultList.fail) {
        setTimeout(function () {
          self.refs.bingSpeechWrap.querySelector('.clear-icon').style.display = 'block';
        }, 0);
      }
    }
    return (
      <div className="status-section" ref="requestStatusSection">{this._showRequestStatusNodes(reqStatus, repResult, _callback)}</div>
    );
  }

  clearInputText(e) {
    let target = e.target;
    target.previousSibling.value = '';
    target.style.display = 'none';
    if(target.previousSibling.classList.contains('computer-input')) {
      this.setState({
        computeVisionReqStatus: this.requestStatusList.initial,
        computeVisionRepResult: this.responseResultList.start,
      });
    }
    if(target.previousSibling.classList.contains('emotion-input')) {
      this.setState({
        emotionReqStatus: this.requestStatusList.initial,
        emotionRepResult: this.responseResultList.start
      });
    }
    if(target.previousSibling.classList.contains('speech-input')) {
      this.setState({
        bingSpeechReqStatus: this.requestStatusList.initial,
        bingSpeechRepResult: this.responseResultList.start,
      });
    }

  }
  
  render() {
    return (<Modal
      contentLabel="micro-cognitive-dialog"
      isOpen={this.state.modalIsOpen}
      className="micro-cognitive-dialog dialog"
      shouldCloseOnOverlayClick={true}
      overlayClassName="dialog-overlay">
     <div className="micro-cognitive-con" ref="microCognitiveDialog">
       <div className="input-section">
         <div className="title-con">
           <h3 className="main-title">{languages.getTranslation('micro-cognitive-services-settings')}</h3>
           <span className="tips-title">{languages.getTranslation('pls-paste-API-keys')}</span>
         </div>
         <div className="field-con">
           <div className="field-tpl computer-vision" ref="computerVisionWrap">
             <span className="field-label">{languages.getTranslation('computer-vision')}</span>
             <div className="input-div">
               <input type="text" className="field-input computer-input" ref="computerVisionInput"/>
               <span className="clear-icon" {...tapOrClick(this.clearInputText)}>x</span>
             </div>
             {this.ComputerVisionRepChange()}
           </div>
           <div className="field-tpl emotion" ref="emotionWrap">
             <span className="field-label">{languages.getTranslation('Emotion')}</span>
             <div className="input-div">
               <input type="text" className="field-input emotion-input" ref="emotionInput"/>
               <span className="clear-icon" {...tapOrClick(this.clearInputText)}>x</span>
             </div>
             {this.emotionRepChange()}
           </div>
           <div className="field-tpl bing-speech" ref="bingSpeechWrap">
             <span className="field-label">{languages.getTranslation('bing-speech')}</span>
             <div className="input-div">
               <input type="text" className="field-input speech-input" ref="bingSpeechInput"/>
               <span className="clear-icon" {...tapOrClick(this.clearInputText)}>x</span>
             </div>
             {this.bingSpeechRepChange()}
           </div>
         </div>
         <div className="extra-con">
           <span className="link-text" {...tapOrClick(this.openMicroCognitiveGuidanceDialog)}>{languages.getTranslation('how-find-API-keys')}</span>
           <img src="img/icon-micro-arrow.png" alt=""/>
         </div>
       </div>
       <div className="button-section">
         <span className="set-button" ref="cognitiveSet" {...tapOrClick(this.sendRequest)}>{languages.getTranslation('cognitive-set')}</span>
       </div>
       <img className="close-button" src="img/icon-closeBtn.png" alt="" {...tapOrClick(this.closeDialog)}/>
     </div>
    </Modal>);
  }

  setInitReqStatus() {
    let obj = {
      computerVision: {
        reqStatus: this.state.computeVisionReqStatus,
        repResult: this.state.computeVisionRepResult
      },
      emotion: {
        reqStatus: this.state.emotionReqStatus,
        repResult: this.state.emotionRepResult
      },
      bingSpeech: {
        reqStatus: this.state.bingSpeechReqStatus,
        repResult: this.state.bingSpeechRepResult
      }
    };
    if(localStorage.getItem('microCognitiveComputerVision')) {
      obj.computerVision.reqStatus = this.requestStatusList.finished;
      obj.computerVision.repResult = this.responseResultList.success;
    }
    if(localStorage.getItem('microCognitiveEmotion')) {
      obj.emotion.reqStatus = this.requestStatusList.finished;
      obj.emotion.repResult = this.responseResultList.success;
    }
    if(localStorage.getItem('microCognitiveBingSpeech')) {
      obj.bingSpeech.reqStatus = this.requestStatusList.finished;
      obj.bingSpeech.repResult = this.responseResultList.success;
    }
    this.setState({
      modalIsOpen: true,
      computeVisionReqStatus: obj.computerVision.reqStatus,
      computeVisionRepResult: obj.computerVision.repResult,
      emotionReqStatus: obj.emotion.reqStatus,
      emotionRepResult: obj.emotion.repResult,
      bingSpeechReqStatus: obj.bingSpeech.reqStatus,
      bingSpeechRepResult: obj.bingSpeech.repResult,
    });
  }

  sendRequest() {
    //localStorage keys:  microCognitiveComputerVision, microCognitiveEmotion, microCognitiveBingSpeech
    //sessionStorage   wifiHasComputerVisionKey, wifiHasEmotionKey, wifiHasBingSpeech
    if(this.isSendRequest) {
      let $computerVision = this.refs.computerVisionInput;
      let $emotion = this.refs.emotionInput;
      let $bingSpeech = this.refs.bingSpeechInput;
      let computerVisionKey = $computerVision.value;
      let emotionKey = $emotion.value;
      let bingSpeechKey = $bingSpeech.value;

      //blur input for Android
      this.refs.computerVisionInput.blur();
      this.refs.emotionInput.blur();
      this.refs.bingSpeechInput.blur();

      //设置参照对象，一次setState
      let obj = {
        computerVision: {
          reqStatus: this.state.computeVisionReqStatus
        },
        emotion: {
          reqStatus: this.state.emotionReqStatus
        },
        bingSpeech: {
          reqStatus: this.state.bingSpeechReqStatus
        }
      };

      //只有当未保存过API keys 和 输入值存在时才触发xmlHttpRequest
      if(!localStorage.getItem('microCognitiveComputerVision') && computerVisionKey) {
        obj.computerVision.reqStatus = this.requestStatusList.loading;
      }else {
        computerVisionKey = null;
      }
      if(!localStorage.getItem('microCognitiveEmotion') && emotionKey) {
        obj.emotion.reqStatus = this.requestStatusList.loading;
      }else {
        emotionKey = null;
      }
      if(!localStorage.getItem('microCognitiveBingSpeech') && bingSpeechKey) {
        obj.bingSpeech.reqStatus = this.requestStatusList.loading;
      }else {
        bingSpeechKey = null;
      }

      if(computerVisionKey || emotionKey || bingSpeechKey) {
        this.refs.cognitiveSet.classList.add('button-disabled');
        this.isSendRequest = false;
        if(computerVisionKey) {
          this.isNotComputerVisionSend = false;
        }
        if(emotionKey) {
          this.isNotEmotionSend = false;
        }
        if(bingSpeechKey) {
          this.isNotBingSpeechSend = false;
        }
      }

      this.setState({
        computeVisionReqStatus: obj.computerVision.reqStatus,
        emotionReqStatus: obj.emotion.reqStatus,
        bingSpeechReqStatus: obj.bingSpeech.reqStatus
      });

      UIActions.configMicroCognitiveComputerVision(computerVisionKey);
      UIActions.configMicroCognitiveEmotion(emotionKey);
      UIActions.configMicroCognitiveBingSpeech(bingSpeechKey);
    }
  }

  setStyleCallback() {
    if(this.isNotComputerVisionSend && this.isNotEmotionSend && this.isNotBingSpeechSend) {
      this.refs.cognitiveSet.classList.remove('button-disabled');
      this.isSendRequest = true;
    }
  }

  computeVisionRepCallback() {
    console.log('configComputerVision Callback');
    let computerVisionRepErrCode = MicroCognitiveStore.getComputerVisionRepErrCode();

    //has already request
    if(this.state.modalIsOpen) {
      if(computerVisionRepErrCode === ErrorCode.EVERYTHING_OK) {
        this.setState({
          computeVisionReqStatus: this.requestStatusList.finished,
          computeVisionRepResult: this.responseResultList.success
        });
        UIActions.syncMicroCognitiveComputerVisionToConfigurator();
      }else {
        this.setState({
          computeVisionReqStatus: this.requestStatusList.finished,
          computeVisionRepResult: this.responseResultList.fail
        });
      }
      this.isNotComputerVisionSend = true;
      this.setStyleCallback();
    }
  }

  emotionRepCallback() {
    console.log('configEmotion Callback');
    let emotionRepErrCode = MicroCognitiveStore.getEmotionRepErrCode();
    if(this.state.modalIsOpen) {
      if(emotionRepErrCode === ErrorCode.EVERYTHING_OK) {
        this.setState({
          emotionReqStatus: this.requestStatusList.finished,
          emotionRepResult: this.responseResultList.success
        });
        UIActions.syncMicroCognitiveEmotionToConfigurator();
      }else {
        this.setState({
          emotionReqStatus: this.requestStatusList.finished,
          emotionRepResult: this.responseResultList.fail
        });
      }
      this.isNotEmotionSend = true;
      this.setStyleCallback();
    }
  }

  bingSpeechRepCallback() {
    console.log('configBingSpeech Callback');
    let bingSpeechRepErrCode = MicroCognitiveStore.getBingSpeechRepErrCode();
    if(this.state.modalIsOpen) {
      if(bingSpeechRepErrCode === ErrorCode.EVERYTHING_OK) {
        this.setState({
          bingSpeechReqStatus: this.requestStatusList.finished,
          bingSpeechRepResult: this.responseResultList.success
        });
        UIActions.syncMicroCognitiveBingSpeechToConfigurator();
      }else {
        this.setState({
          bingSpeechReqStatus: this.requestStatusList.finished,
          bingSpeechRepResult: this.responseResultList.fail
        });
      }
      this.isNotBingSpeechSend = true;
      this.setStyleCallback();
    }
  }

  openMicroCognitiveGuidanceDialog() {
    UIActions.openMicroCognitiveGuidanceDialog();
  }


  componentDidMount() {
    MicroCognitiveStore.on(Events.OPEN_MICRO_COGNITIVE, this.openDialog);
    MicroCognitiveStore.on(Events.MICRO_COMPUTER_VISION_REQUEST_CALLBACK, this.computeVisionRepCallback);
    MicroCognitiveStore.on(Events.MICRO_EMOTION_REQUEST_CALLBACK, this.emotionRepCallback);
    MicroCognitiveStore.on(Events.MICRO_BING_SPEECH_REQUEST_CALLBACK, this.bingSpeechRepCallback);
    if(window._runtime == 'cordova' && /Android/.test(navigator.appVersion)) {
      window.addEventListener('native.keyboardshow', ()=> {
        if (window.scrollY < 100 && this.refs.microCognitiveDialog) //键盘高度一般大于100，如果scrollY小于100，可以认为界面未上移，则需要手动上移
        {
          this.refs.microCognitiveDialog.parentNode.style.bottom = 2 * this.refs.microCognitiveDialog.getBoundingClientRect().top+'px';
        }
      });
      window.addEventListener('native.keyboardhide', ()=>{
        if( this.refs.microCognitiveDialog) {
          this.refs.microCognitiveDialog.parentNode.style.bottom = '';
        }
      });
    }
  }

  componentWillUnmount() {
    MicroCognitiveStore.off(Events.OPEN_MICRO_COGNITIVE, this.openDialog);
    MicroCognitiveStore.off(Events.MICRO_COMPUTER_VISION_REQUEST_CALLBACK, this.computeVisionRepCallback);
    MicroCognitiveStore.off(Events.MICRO_EMOTION_REQUEST_CALLBACK, this.emotionRepCallback);
    MicroCognitiveStore.off(Events.MICRO_BING_SPEECH_REQUEST_CALLBACK, this.bingSpeechRepCallback);
    if(window._runtime == 'cordova' && /Android/.test(navigator.appVersion)) {
      window.removeEventListener('native.keyboardshow');
      window.removeEventListener('native.keyboardhide');
    }
  }
}

export {MicrosoftCognitive};