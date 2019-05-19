/**
 * Created by KongyunWu on 2017/5/11.
 */
import React, { Component } from 'react';
import tapOrClick from 'react-tap-or-click';
import UIActions from '../../actions/UIActions';
import MicroCognitiveStore from '../../stores/MicroCognitiveStore';
import wifiStore from '../../stores/wifiStore';
import Events from '../../constants/Events';
import languages from '../../languages';
import { Select } from './Select.react';

class EmotionTest extends Component {
  constructor() {
    super(...arguments);
    this.wifiNetworkState = wifiStore.getWifiNetworkState();
    console.log('wifiNetworkstate', wifiStore.getWifiNetworkState());
    this.setMicroCognitiveList = {
      hasSet: 'hasSet',
      unSet: 'unSet',
      unWifiConnected: 'unWifiConnected',
      expired: 'expired'
    };
    console.log('emotionProps', this.props);
    this.state = {
      isSetMicroCognitive: this.setMicroCognitiveList.hasSet,
      isActive: false,
      selection: this.props.configs.emotion.defaultValue,
      reRender: false
    };

    this.setMicroCognitiveStatus = this.setMicroCognitiveStatus.bind(this);
  }

  setMicroCognitiveStatus() {
    //init configurator
    let setMicroEmotionStatus = '';
    if(wifiStore.getWifiNetworkState() !== 'connected') {
      setMicroEmotionStatus = this.setMicroCognitiveList.unWifiConnected;
    }else {
      if(localStorage.getItem('microCognitiveEmotion')) {
        setMicroEmotionStatus = this.setMicroCognitiveList.hasSet;
      }else {
        setMicroEmotionStatus = this.setMicroCognitiveList.unSet;
      }
    }
    console.log('setMicroEmotionStatus', setMicroEmotionStatus);
    this.setState({
      isSetMicroCognitive: setMicroEmotionStatus
    });

  }

  openSetMicroDialog() {
    UIActions.openMicroCognitiveDialog();
  }

  openWifiDialog() {
    UIActions.openWifiDialog('AP');
  }

  render(){
    switch (this.state.isSetMicroCognitive) {
    case this.setMicroCognitiveList.hasSet:
      return (
        <div ref="microCognitiveUnset">
          <Select key={'emotion'} name={'emotion'} config={this.props.configs.emotion} selectStyle={this.props.selectStyle} onChange={this.props.onChange} />
        </div>
      );
    case this.setMicroCognitiveList.unSet:
      return(
        <div className="unset" ref="microCognitiveUnset">
          <div className="text">{languages.getTranslation('micro-cognitive')}</div>
          <div className="button" {...tapOrClick(this.openSetMicroDialog)}>{languages.getTranslation('cognitive-set')}</div>
        </div>
      );
    case this.setMicroCognitiveList.unWifiConnected:
      return(
        <div className="unconnected" ref="microCognitiveUnset">
          <div className="text">{languages.getTranslation('wifi-need-connect')}</div>
          <div className="button" {...tapOrClick(this.openWifiDialog)}>{languages.getTranslation('cognitive-setup')}</div>
        </div>
      );
    case this.setMicroCognitiveList.expired:
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

  listChange(list) {
    this.list = list;
    //if the updated list didn't contains selected option, set selection to ''
    if(list.indexOf(this.state.selection) === -1) {
      this.setState({
        reRender: true,
        selection: ''
      });
    } else {
      this.setState({
        reRender: true
      });
    }

  }
  soundChanged(option) {
    this.setState({
      selection: option
    });
  }

  componentDidMount() {
    let self = this;
    self.setMicroCognitiveStatus();
    MicroCognitiveStore.on(Events.SYNC_MICRO_COGNITIVE_EMOTION_TO_CONFIGURATOR, this.setMicroCognitiveStatus);
    if(this.state.isSetMicroCognitive === this.setMicroCognitiveList.hasSet) {
      for ( let key in this.props.configs){
        if (this.props.configs[key].hasOwnProperty('defaultValue')){
          this.props.onChange && this.props.onChange( key, this.props.configs[key].defaultValue);
        }
      }
    }
  }

  componentDidUpdate() {
    if(this.state.isSetMicroCognitive !== this.setMicroCognitiveList.hasSet) {
      this.refs.microCognitiveUnset.closest('.node-config ').classList.add('micro-cognitive');
    }else {
      this.refs.microCognitiveUnset.closest('.node-config ').classList.remove('micro-cognitive');
    }
  }

  componentWillUnmount() {
    MicroCognitiveStore.off(Events.SYNC_MICRO_COGNITIVE_EMOTION_TO_CONFIGURATOR, this.setMicroCognitiveStatus);
  }
}

export { EmotionTest };