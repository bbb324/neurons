import React, { Component } from 'react';
import { Select } from './Select.react';
import { NumberInput } from './NumberInput.react';
import { ColorPanel } from './ColorPanel.react';
import { Image } from './Image.react';
import { Pattern } from './Pattern.react';
import tapOrClick from 'react-tap-or-click';
import UIActions from '../../actions/UIActions';
import editerStore from '../../stores/editerStore';
import nodeStore from '../../stores/nodeStore';
import languages from '../../languages';
import { Hold } from './Hold.react';
import { Gyro } from './Gyro.react';
import { ColorCheck } from './ColorCheck.react';
import { Face } from './Face.react';
import { Text } from './Text.react';
import { SoundRecordManagement } from './SoundRecordManagement.react';
import { PlaySound } from './PlaySound.react';
import { PlayMusic } from './PlayMusic.react';
import { Speech } from './Speech.react';
import { MatchText } from './MatchText.react';
import { SnapShotPicture } from './SnapShotPicture.react';
import { SpeakerRecognize } from './SpeakerRecognize.react';
import {EmotionTest} from './EmotionTest.react';
import {SmartServoAction} from './SmartServoAction.react';
import { SequenceSetting } from './SequenceSetting.react';
import {ImageToText} from './ImageToText.react';
import {setWindowHeight} from '../../utils/dom';
import engine from '../../core/FlowEngine';
import commonStore from '../../stores/commonStore';
require('./Configurator.less');

class Configurator extends Component {
  constructor() {
    super(...arguments);
    this.conf = {};
    this.defaultConf = {};
    this.state = {
      isActive: true
    };
    this.soundSaveStatus = false;
  }

  onConfig(key, value,play){
    if('undefined' === (typeof play)){
      play = true;
    }    
    let conf = {[key]: value};
    console.log(conf);
    UIActions.configNode(this.props.nodeId, conf, play);
    this.props.onConfigChange && this.props.onConfigChange(conf); 
  }

  onConfirm() {
    UIActions.nodeTap(this.props.nodeId, this.props.type);
  }

  renderControl(key, config){
    let control = null;
    switch(config.type) {
    case 'options':
      control = (<Select key={key} name={key} config={config} selectStyle={this.props.selectStyle} onChange={this.onConfig.bind(this)}/>);
      break;
    case 'number': 
      control = (<NumberInput key={key} name={key} config={config} numberStyle={this.props.numberStyle} onChange={this.onConfig.bind(this)}/>);
      break;
    case 'color':
      control = (<ColorPanel key={key} name={key} selected={this.props.selected} onChange={this.onConfig.bind(this)}/>);
      break;
    case 'image':
      control = (<Image key={key} name={key} id={this.props.nodeId} selected={this.props.selected} editImage={this.props.editImage} onChange={this.onConfig.bind(this)} />);
      break;
    case 'pattern':
      control = (<Pattern key={key} name={key} id={this.props.nodeId} selected={this.props.selected} editPattern={this.props.editPattern} onChange={this.onConfig.bind(this)} />);
      break;
    case 'hidden':
      break;
    default:
      console.log('config type not support: ', config.type);

    }
    if (config.hasOwnProperty('defaultValue')){
      this.defaultConf[key] = config.defaultValue;
    }
    return control;
  }

  renderRange(configs){
    let self = this;
    let controls = [];
    controls.push(self.renderControl('from', configs.from));
    controls.push(<div className='range' key={'rangeIcon'}>~</div>);
    controls.push(self.renderControl('to', configs.to));
    return controls;
  }

  renderScaleRange(configs){
    let self = this;
    let controls = [];
    controls.push(self.renderControl('minin', configs.minin));
    controls.push(<div className='range' key={'inputRange'}>~</div>);
    controls.push(self.renderControl('maxin', configs.maxin));
    controls.push(<img className="scale-to" key={'scale-to'} src='./img/icon-scale-to.png' />);
    controls.push(self.renderControl('minout', configs.minout));
    controls.push(<div className='range' key={'outputRange'}>~</div>);
    controls.push(self.renderControl('maxout', configs.maxout));    
    return controls;
  } 

  renderPulse(configs){
    let self = this;
    return (
      <div className="pulse-wrap">
        {self.renderControl('func', configs.func)}
        <div className="wave-wrap">
          <span className="wavelength" key='waveLength'>{languages.getTranslation('wavelength')}</span>
          {self.renderControl('wavelength', configs.wavelength)}
          <span className="second" key='s'>s</span>
        </div>
        <div className="amplitude-wrap">
          <span className="amplitude" key='amp'>{languages.getTranslation('amplitude')}</span>
          {self.renderControl('amplitude', configs.amplitude)}
        </div>
      </div>
    );
  }

  renderCounter(configs){
    let self = this;
    return (
      <div className="counter-wrap">
        <div className="reset-after-wrap">
          <span className="reset-after" key='reset'>{languages.getTranslation('resetAfter')}</span>
          {self.renderControl('resetAfter', configs.resetAfter)}
        </div>
      </div>
    );
  } 

  render() {
    let self = this;
    let controls = [];
    let configs = nodeStore.getNodeConfigs(this.props.nodeId);
    switch (self.props.bodyStyle) {
    case 'counter':
      controls = self.renderCounter(configs);
      break;      
    case 'range':
      controls = self.renderRange(configs);
      break;
    case 'scale':
      controls = self.renderScaleRange(configs);
      break;
    case 'pulse':
      controls = self.renderPulse(configs);
      break;
    case 'hold':
      controls = (<Hold configs={configs} bodyStyle={self.props.bodyStyle}  numberStyle={self.props.numberStyle} selectStyle={this.props.selectStyle} id={this.props.nodeId}  onChange={this.onConfig.bind(this)} />);
      break;
    case 'gyro':
      controls = (<Gyro configs={configs} bodyStyle={self.props.bodyStyle}  selectStyle={this.props.selectStyle} id={this.props.nodeId}  onChange={this.onConfig.bind(this)} />);
      break;
    case 'colorCheck':
      controls = (<ColorCheck configs={configs} bodyStyle={self.props.bodyStyle} id={this.props.nodeId}  onChange={this.onConfig.bind(this)} />);
      break;
    case 'face':
      controls = (<Face configs={configs} bodyStyle={self.props.bodyStyle}  selectStyle={this.props.selectStyle} id={this.props.nodeId}  onChange={this.onConfig.bind(this)} />);
      break;
    case 'text':
      controls = (<Text configs={configs} bodyStyle={self.props.bodyStyle}  selectStyle={this.props.selectStyle} id={this.props.nodeId}  onChange={this.onConfig.bind(this)} />);
      break;
    case 'record':
      controls=(<SoundRecordManagement id={this.props.nodeId} configs={configs} onChange={this.onConfig.bind(this)}  name={configs.name.defaultValue} />);
      break;
    case 'playsound':
      controls=(<PlaySound configs={configs} id={this.props.nodeId} selectStyle={this.props.selectStyle} onChange={this.onConfig.bind(this)}/>);
      break;
    case 'speech':
      controls=(<Speech configs={configs} id={this.props.nodeId} onChange={this.onConfig.bind(this)}/>);
      break;
    case 'playmusic':
      controls = (<PlayMusic configs={configs} id={this.props.nodeId} onChange={this.onConfig.bind(this)}/>);
      break;
    case 'matchText':
      controls=(<MatchText configs={configs} id={this.props.nodeId} onChange={this.onConfig.bind(this)}/>);
      break;
    case 'snapShot':
      controls = (<SnapShotPicture configs={configs} id={this.props.nodeId} onChange={this.onConfig.bind(this)}
                                   isActive={this.state.isActive}/>);
      break;
    case 'speakerRecognize':
      controls=(<SpeakerRecognize configs={configs} id={this.props.nodeId}/>);
      break;
    case 'emotionTest':
      controls=(<EmotionTest configs={configs} id={this.props.nodeId} selectStyle={this.props.selectStyle} onChange={this.onConfig.bind(this)}/>);
      break;
    case 'imageToText':
      controls=(<ImageToText configs={configs} id={this.props.nodeId}/>);
      break;
    case 'smartServoAction':
      controls = (<SmartServoAction configs={configs} id={this.props.nodeId} selectStyle={this.props.selectStyle } onChange={this.onConfig.bind(this)}/>);
      break;
    case 'sequence':
      controls=(<SequenceSetting id={this.props.nodeId} configs={configs} portId={this.props.portId} config={this.sequenceConfig} onChange={this.onConfig.bind(this)}/>);
      break;
    default:
      for(let key in configs) {
        if(configs.hasOwnProperty(key)) {
          controls.push(self.renderControl(key, configs[key]));
        }
      }
      break;
    }

    return(<div className={'node-config ' + (this.state.isActive==true?'':'hide')} data-bodyStyle={this.props.bodyStyle} ref='configPanel'>
        <div className='triangle' ref='triangle'></div>
        <span className='title'>{this.props.title}</span>
        {controls}
        <div className='confirm' {...tapOrClick(this.onConfirm.bind(this))}>{languages.getTranslation('icon-confirm-ok')}</div>
      </div>
    );
  }

  toggleConfig(){
    let self = this;
    let config = editerStore.getConfigureNode();
    if(config && config.id == self.props.nodeId && self.props.action != 'hideConfig') {
      if(!self.state.isActive) {
        self.setState({
          isActive: true
        });

        if (window._runtime == 'cordova') {
          window.ga.trackEvent('expandConfig', this.props.type);
        }
      }
    }
    else {
      if(self.state.isActive) {
        self.setState({
          isActive: false
        });
      }
    }
  }

  //for sequence node, keep config panel display
  keepConfigDisplay (ele, nodeId){
    if(nodeId == this.props.nodeId && ele && ele.closest('.hide-config')) {
      this.setState({
        isActive: false
      });
    } else if( nodeId == this.props.nodeId && ele && ele.closest('.keep-config-alive')) {
      this.setState({
        isActive: true
      });
    } else {
      this.toggleConfig();  // if tapped node is not sequence, do normal logic
    }
  }

  resetConfigPosition() {
    //judge configuratorPanel is top of node or bottom of node  by node's bottom
    let palettePanelHeight = document.querySelector('.editer-palette-nodes').offsetHeight;
    let parentNode = this.refs.configPanel.parentNode;
    let parentOffsetBottom = setWindowHeight() - parentNode.getBoundingClientRect().bottom;
    let selfHeight = this.refs.configPanel.offsetHeight;
    let selfMarginTop = Number(window.getComputedStyle(document.querySelector('.node-config'))['margin-top'].substring(0,2));
    let triangleHeight = this.refs.triangle.offsetHeight;
    let selfTotalHeight = selfHeight + selfMarginTop + triangleHeight;
    if(palettePanelHeight + selfTotalHeight - parentOffsetBottom > 0) {
      this.refs.configPanel.style.top = -selfTotalHeight + 'px';
      this.refs.triangle.classList.add('triangle-direction-bottom');
    } else {
      let parentHeight = parentNode.offsetHeight;
      this.refs.configPanel.style.top = parentHeight + 'px';
      this.refs.triangle.classList.remove('triangle-direction-bottom');
    }
  }

  openConfiguratorWithSubNode(nodeId) {
    if(nodeId === this.props.nodeId) {
      this.setState({
        isActive: true
      });
    }
  }

  componentDidMount() {
    for ( let key in this.defaultConf){
      if(this.defaultConf.hasOwnProperty(key)) {
        this.onConfig( key, this.defaultConf[key] );
      }
    }

    this.toggleConfigFunc = this.toggleConfig.bind(this);
    this.keepConfigDisplayFunc = this.keepConfigDisplay.bind(this);
    this.openConfiguratorWithSubNode = this.openConfiguratorWithSubNode.bind(this);
    editerStore.on('configureNode', this.toggleConfigFunc);
    editerStore.on('activateNode', this.keepConfigDisplayFunc);
    commonStore.on('openConfiguratorWithSubNode', this.openConfiguratorWithSubNode);
  }

  shouldComponentUpdate(props, state) {
    if (props.type == 'SEQUENCE' && this.state.isActive == true) {
      this.sequenceConfig = {
        portId: props.portId,
        second: engine.getNodeCurrentConfig(this.props.nodeId, props.portId) || 1,
        repeat: engine.getNodeCurrentConfig(this.props.nodeId, 'repeat') || true
      };

      return true;
    } else if(this.state.isActive != state.isActive) {
      return true;
    }
    return false;
  }

  componentDidUpdate() {
    if(this.state.isActive == false) {
      return;
    }
    this.resetConfigPosition();
  }

  componentWillUnmount(){
    editerStore.off('configureNode', this.toggleConfigFunc);
    editerStore.off('activateNode', this.keepConfigDisplayFunc);
    commonStore.off('openConfiguratorWithSubNode', this.openConfiguratorWithSubNode);
    editerStore.clearConfig();
  }

}

export { Configurator };
