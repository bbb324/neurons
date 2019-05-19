/**
 * Created by KongyunWu on 2017/5/10.
 */
/**
 * Created by KongyunWu on 2017/5/10.
 */
import React, { Component } from 'react';
import languages from '../../languages';
import wifiStore from '../../stores/wifiStore';
import tapOrClick from 'react-tap-or-click';
import UIActions from '../../actions/UIActions';
import MicroCognitiveStore from '../../stores/MicroCognitiveStore';
import Events from '../../constants/Events';

class SpeakerRecognize extends Component {
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

    this.state = {
      isSetMicroBingSpeech: this.setMicroBingSpeechList.hasSet
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

  render(){
    switch (this.state.isSetMicroBingSpeech) {
    case this.setMicroBingSpeechList.hasSet:
      return(
        <div className="has-set">
          <div className="text">{languages.getTranslation('micro-cognitive')}</div>
          <div className="button">{languages.getTranslation('cognitive-successful')}</div>
        </div>
      );
    case this.setMicroBingSpeechList.unSet:
      return(
        <div className="unset">
          <div className="text">{languages.getTranslation('micro-cognitive')}</div>
          <div className="button" {...tapOrClick(this.openSetMicroDialog)}>{languages.getTranslation('cognitive-set')}</div>
        </div>
      );
    case this.setMicroBingSpeechList.unWifiConnected:
      return(
        <div className="unconnected">
          <div className="text">{languages.getTranslation('wifi-need-connect')}</div>
          <div className="button" {...tapOrClick(this.openWifiDialog)}>{languages.getTranslation('cognitive-setup')}</div>
        </div>
      );
    case this.setMicroBingSpeechList.expired:
      return(
        <div className="expired">
          <div className="text">{languages.getTranslation('wifi-need-connect')}</div>
          <div className="button" {...tapOrClick(this.openWifiDialog)}>{languages.getTranslation('cognitive-disabled')}</div>
        </div>
      );
    default:
      break;
    }
  }

  componentDidMount() {
    this.setMicroCognitiveStatus();
    MicroCognitiveStore.on(Events.SYNC_MICRO_COGNITIVE_BING_SPEECH_TO_CONFIGURATOR, this.setMicroCognitiveStatus);
  }

  componentWillUnmount() {
    MicroCognitiveStore.off(Events.SYNC_MICRO_COGNITIVE_BING_SPEECH_TO_CONFIGURATOR, this.setMicroCognitiveStatus);
  }
}
export { SpeakerRecognize };