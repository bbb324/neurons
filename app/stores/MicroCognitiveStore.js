/**
 * Created by KongyunWu on 2017/5/8.
 */
import EventEmitter from 'wolfy87-eventemitter';
import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants from '../constants/AppConstants';
import ErrorCode from '../constants/ErrorCode';
import Events from '../constants/Events';
import RestfulApiImpl from '../utils/RestfulApiImpl';
import UIActions from '../actions/UIActions';

const TIMEOUT = 60000;

class MicroCognitiveStore extends EventEmitter {
  constructor() {
    super(...arguments);
    this.ComputerVisionRepErrCode = '';
    this.emotionRepErrCode = '';
    this.bingSpeechRepErrCode = '';
    this.wifiUrl = '';

    AppDispatcher.register((action) => {
      switch (action.actionType) {
      case AppConstants.OPEN_MICRO_COGNITIVE_DIALOG:
        this.trigger(Events.OPEN_MICRO_COGNITIVE);
        break;
      case AppConstants.OPEN_MICRO_COGNITIVE_GUIDANCE_DIALOG:
        this.trigger(Events.OPEN_MICRO_COGNITIVE_GUIDANCE);
        break;
      case AppConstants.CONFIG_MICRO_COGNITIVE_COMPUTER_VISION:
        action.computerVisionKey && this.postConfigComputerVision(action.computerVisionKey);
        break;
      case AppConstants.CONFIG_MICRO_COGNITIVE_EMOTION:
        action.emotionKey && this.postConfigEmotion(action.emotionKey);
        break;
      case AppConstants.CONFIG_MICRO_COGNITIVE_BING_SPEECH:
        action.bingSpeechKey && this.postConfigBingSpeech(action.bingSpeechKey);
        break;
      case AppConstants.SYNC_MICRO_COGNITIVE_TO_CONFIGURATORS:
        this.trigger(Events.SYNC_MICRO_COGNITIVE_COMPUTER_VISION_TO_CONFIGURATOR);
        this.trigger(Events.SYNC_MICRO_COGNITIVE_EMOTION_TO_CONFIGURATOR);
        this.trigger(Events.SYNC_MICRO_COGNITIVE_BING_SPEECH_TO_CONFIGURATOR);
        break;
      case AppConstants.SYNC_MICRO_COGNITIVE_COMPUTER_VISION_TO_CONFIGURATOR:
        this.trigger(Events.SYNC_MICRO_COGNITIVE_COMPUTER_VISION_TO_CONFIGURATOR);
        break;
      case AppConstants.SYNC_MICRO_COGNITIVE_EMOTION_TO_CONFIGURATOR:
        this.trigger(Events.SYNC_MICRO_COGNITIVE_EMOTION_TO_CONFIGURATOR);
        break;
      case AppConstants.SYNC_MICRO_COGNITIVE_BING_SPEECH_TO_CONFIGURATOR:
        this.trigger(Events.SYNC_MICRO_COGNITIVE_BING_SPEECH_TO_CONFIGURATOR);
        break;
      default:
        break;
      }
    });
  }

  wifiConnectedCallback(url) {
    this.wifiUrl = url;
    console.log('wifiConnectedMicroCallback');
    UIActions.syncMicroCognitiveToConfigurators();

    setTimeout(function () {
      UIActions.setMicroNodeKey();
    }, 0);

  }

  wifiDisconnectedCallback() {
    console.log('wifiDisconnectedMicroCallback');
    setTimeout(() => {
      UIActions.syncMicroCognitiveToConfigurators();
      UIActions.setMicroNodeKey();
    },0);

  }

  postConfigComputerVision(computerVisionKey) {
    if(this.wifiUrl) {
      let url = this.wifiUrl + '/configComputerVision';
      let data = {key: computerVisionKey};
      let self = this;
      let callback = function (status,responseText) {
        if(status === 200) {
          let repData = JSON.parse(responseText);
          console.log('configComputerVision repData:', responseText);
          self.setComputerVisionRepErrCode(repData.errCode);
          if(repData.errCode === ErrorCode.EVERYTHING_OK) {
            localStorage.setItem('microCognitiveComputerVision', computerVisionKey);
          }
          self.trigger(Events.MICRO_COMPUTER_VISION_REQUEST_CALLBACK);
        }else {
          console.log('configComputerVision fail');
          localStorage.removeItem('microCognitiveComputerVision');
          self.trigger(Events.MICRO_COMPUTER_VISION_REQUEST_CALLBACK);
        }

        setTimeout(function () {
          UIActions.setMicroNodeKey();
        }, 1);
      };
      RestfulApiImpl.doPost(url, JSON.stringify(data), callback, TIMEOUT);
    }else{
      console.log('wifiUrl not set');
    }
  }

  postConfigEmotion(emotionKey) {
    if(this.wifiUrl) {
      let url = this.wifiUrl + '/configEmotion';
      let data = {key: emotionKey};
      let self = this;
      let callback = function (status,responseText) {
        if(status === 200) {
          let repData = JSON.parse(responseText);
          self.setEmotionRepErrCode(repData.errCode);
          console.log('configEmotion repData:', responseText);
          if(repData.errCode === ErrorCode.EVERYTHING_OK) {
            localStorage.setItem('microCognitiveEmotion', emotionKey);
          }
          self.trigger(Events.MICRO_EMOTION_REQUEST_CALLBACK);
        }else {
          console.log('configEmotion fail');
          localStorage.removeItem('microCognitiveEmotion');
          self.trigger(Events.MICRO_EMOTION_REQUEST_CALLBACK);
        }

        setTimeout(function () {
          UIActions.setMicroNodeKey();
        }, 1);
      };
      RestfulApiImpl.doPost(url, JSON.stringify(data), callback, TIMEOUT);
    }else{
      console.log('wifiUrl not set');
    }
  }

  postConfigBingSpeech(bingSpeechKey) {
    if(this.wifiUrl) {
      let url = this.wifiUrl + '/configBingSpeech';
      let data = {key: bingSpeechKey};
      let self = this;
      let callback = function (status,responseText) {
        if(status === 200) {
          let repData = JSON.parse(responseText);
          console.log('configBingSpeech repData:', responseText);
          self.setBingSpeechRepErrCode(repData.errCode);
          if(repData.errCode === ErrorCode.EVERYTHING_OK) {
            localStorage.setItem('microCognitiveBingSpeech', bingSpeechKey);
          }
          self.trigger(Events.MICRO_BING_SPEECH_REQUEST_CALLBACK);
        }else {
          console.log('configBingSpeech timeout');
          localStorage.removeItem('microCognitiveBingSpeech');
          self.trigger(Events.MICRO_BING_SPEECH_REQUEST_CALLBACK);
        }

        setTimeout(function () {
          UIActions.setMicroNodeKey();
        }, 1);
      };
      RestfulApiImpl.doPost(url, JSON.stringify(data), callback, TIMEOUT);
    }else{
      console.log('wifiUrl not set');
    }

  }

  setComputerVisionRepErrCode(errCode) {
    this.ComputerVisionRepErrCode = errCode;
  }

  getComputerVisionRepErrCode() {
    return this.ComputerVisionRepErrCode;
  }

  setEmotionRepErrCode(errCode) {
    this.emotionRepErrCode = errCode;
  }

  getEmotionRepErrCode() {
    return this.emotionRepErrCode;
  }

  setBingSpeechRepErrCode(errCode) {
    this.bingSpeechRepErrCode = errCode;
  }

  getBingSpeechRepErrCode() {
    return this.bingSpeechRepErrCode;
  }
}

let _instance = new MicroCognitiveStore();
export default  _instance;