import React, { Component } from 'react';
import tapOrClick from 'react-tap-or-click';
import languages from '../../languages';
import UIActions from '../../actions/UIActions';
import AppDispatcher from '../../dispatcher/AppDispatcher';
import AppConstants from '../../constants/AppConstants';
import MicroCognitiveStore from '../../stores/MicroCognitiveStore';
import wifiStore from '../../stores/wifiStore';
import Events from '../../constants/Events';
require('./Configurator.less');

class Speech extends Component {
  constructor() {
    super(...arguments);
    this.wifiNetworkState = wifiStore.getWifiNetworkState();
    console.log('wifiNetworkstate', this.wifiNetworkState);
    this.setMicroBingSpeechList = {
      hasSet: 'hasSet',
      unSet: 'unSet',
      unWifiConnected: 'unWifiConnected',
      expired: 'expired'
    };
    this.defaultConf = {};
    this.state = {
      isSetMicroBingSpeech: this.setMicroBingSpeechList.hasSet,
      isActive: false,
      text: this.props.configs.text.defaultValue
    };

    this.setMicroCognitiveStatus = this.setMicroCognitiveStatus.bind(this);
  }

  setMicroCognitiveStatus() {
    //init configurator
    let setMicroBingSpeechStatus = '';
    if(wifiStore.getWifiNetworkState() !== 'connected') {
      setMicroBingSpeechStatus = this.setMicroBingSpeechList.unWifiConnected;
    }else {
      if(localStorage.getItem('microCognitiveBingSpeech')) {
        setMicroBingSpeechStatus = this.setMicroBingSpeechList.hasSet;
      }else {
        setMicroBingSpeechStatus = this.setMicroBingSpeechList.unSet;
      }
    }
    console.log('setMicroBingSpeechStatus', setMicroBingSpeechStatus);
    this.setState({
      isSetMicroBingSpeech: setMicroBingSpeechStatus
    });

  }

  openSetMicroDialog() {
    UIActions.openMicroCognitiveDialog();
  }

  openWifiDialog() {
    UIActions.openWifiDialog('AP');
  }

  playEffect(){
    this.props.onChange && this.props.onChange('test', true);
  }

  editText(){
    UIActions.setTextInput(this.props.id, this.state.text);
  }

  render(){
    switch (this.state.isSetMicroBingSpeech) {
    case this.setMicroBingSpeechList.hasSet:
      return (
        <div ref="microCognitiveUnset">
          <div className={'text-content ' + (this.state.text===''?'translucent':'')} {...tapOrClick(this.editText.bind(this))} >{this.state.text===''?languages.getTranslation('please input content'):this.state.text}</div>
          <div className="buttom">
            <img className="play" {...tapOrClick(this.playEffect.bind(this))} src='./img/speech-play.png' />
          </div>
        </div>
      );
    case this.setMicroBingSpeechList.unSet:
      return(
        <div className="unset" ref="microCognitiveUnset">
          <div className="text">{languages.getTranslation('micro-cognitive')}</div>
          <div className="button" {...tapOrClick(this.openSetMicroDialog)}>{languages.getTranslation('cognitive-set')}</div>
        </div>
      );
    case this.setMicroBingSpeechList.unWifiConnected:
      return(
        <div className="unconnected" ref="microCognitiveUnset">
          <div className="text">{languages.getTranslation('wifi-need-connect')}</div>
          <div className="button" {...tapOrClick(this.openWifiDialog)}>{languages.getTranslation('cognitive-setup')}</div>
        </div>
      );
    case this.setMicroBingSpeechList.expired:
      return(
        <div className="expired" ref="microCognitiveUnset">
          <div className="text">{languages.getTranslation('wifi-need-connect')}</div>
          <div className="button" {...tapOrClick(this.openWifiDialog)}>{languages.getTranslation('cognitive-disabled')}</div>
        </div>
      );
    default:
      break;
    }

  }

  componentDidMount(){
    let self = this;
    self.setMicroCognitiveStatus();
    for ( let key in self.props.configs){
      if (self.props.configs[key].hasOwnProperty('defaultValue')){
        self.props.onChange && self.props.onChange( key, self.props.configs[key].defaultValue);
      }
    }    
    this._register = AppDispatcher.register((action)=>{
      if(action.actionType == AppConstants.EDITER_NODE_CONFIG) {
        if(self.refs.textInput && self.refs.textInput.id == action.nodeId) {
          self.setState({text: action.conf.text || ''});
        }
      } else if (action.actionType == AppConstants.GET_TEXT_INPUT) {
        if (action.id === self.props.id){
          self.setState({text: action.text || ''});
        }
      }
    });
    MicroCognitiveStore.on(Events.SYNC_MICRO_COGNITIVE_BING_SPEECH_TO_CONFIGURATOR, this.setMicroCognitiveStatus);
  }

  componentDidUpdate() {
    if(this.state.isSetMicroBingSpeech !== this.setMicroBingSpeechList.hasSet) {
      this.refs.microCognitiveUnset.closest('.node-config ').classList.add('micro-cognitive');
    }else {
      this.refs.microCognitiveUnset.closest('.node-config ').classList.remove('micro-cognitive');
    }
  }

  componentWillUnmount(){
    AppDispatcher.unregister(this._register);
    MicroCognitiveStore.off(Events.SYNC_MICRO_COGNITIVE_BING_SPEECH_TO_CONFIGURATOR, this.setMicroCognitiveStatus);
  }   

}

export { Speech };