import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../Node.react';
import languages from '../../../../languages';
import nodeStore from '../../../../stores/nodeStore';
import wifiStore from '../../../../stores/wifiStore';
import UIActions from '../../../../actions/UIActions';
import AppDispatcher from '../../../../dispatcher/AppDispatcher';
import AppConstants from '../../../../constants/AppConstants';

require('./EmotionTest.less');

class EmotionTestNode extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {
      emotionValue: this.props.info.props.configs.emotion.defaultValue,
      hasMicroKey: true
    };
    this.getEmotionIcon = this.getEmotionIcon.bind(this);
    this.setMicroKey = this.setMicroKey.bind(this);
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src='./img/icon-emotion-test.png' />
        <span className="node-preview-name">{languages.getTranslation('emotion-test')}</span>
      </div>
    );
  }

  onConfigChange(action) {
    if(action.nodeId !== this.props.id) return;
    let newState = {};
    if(action.conf.hasOwnProperty('emotion')) {
      newState.emotionValue = action.conf.emotion;
      this.setState(newState);
    }

  }

  getEmotionIcon() {
    let url='';
    switch (this.state.emotionValue) {
    case 'happiness':
      url = './img/emotion/icon-happiness.png';
      break;
    case 'anger':
      url = './img/emotion/icon-anger.png';
      break;
    case 'sadness':
      url = './img/emotion/icon-sadness.png';
      break;
    case 'fear':
      url = './img/emotion/icon-fear.png';
      break;
    case 'surprise':
      url = './img/emotion/icon-surprise.png';
      break;
    }
    return (<img className="node-actual-icon" src={url} />);
  }

  setMicroKey() {
    if (wifiStore.getWifiNetworkState() !== 'connected' || !localStorage.getItem('microCognitiveEmotion')) {
      this.setState({
        hasMicroKey: false
      });
    }else {
      this.setState({
        hasMicroKey: true
      });
    }
  }

  renderActual() {
    return (
      <div className={'node-actual node-type-' + this.props.info.name + (this.state.hasMicroKey === false ? ' plaint-wrap': '')} id={this.props.id} style={{
        left: this.props.left + 'px',
        top: this.props.top + 'px'
      }} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <div className='node-body node-draggable'>
          <div className='node-actual-body'>
            {this.getEmotionIcon()}
          </div>
        </div>
        {this.state.hasMicroKey === false ? <img className={'plaint'} src="./img/icon-node-plaint.png" alt=""/> : ''}
        <Inputs ports={this.props.info.props.in} nodeId={this.props.id}/>
        <Outputs ports={this.props.info.props.out} nodeId={this.props.id} showValue={true}/>
        <Tools nodeId={this.props.id}/>
      </div>
    );
  }

  render() {
    return this.props.isPreview ? this.renderPreview() : this.renderActual();
  }


  componentDidMount() {
    let self = this;
    if(this.props.id) {
      self.setState({
        emotionValue: nodeStore.getNodeConfigs(this.props.id).emotion.defaultValue
      });
      UIActions.initConfig(this.props.id);
    }
    self._register = AppDispatcher.register((action) => {
      if (action.actionType === AppConstants.EDITER_NODE_CONFIG) {
        self.onConfigChange(action);
      }
      if (action.actionType === AppConstants.SET_MICRO_NODE_INPUT) {
        this.setMicroKey();
      }
    });
  }

  componentWillUnmount() {
    AppDispatcher.unregister(this._register);
  }

}

export { EmotionTestNode };