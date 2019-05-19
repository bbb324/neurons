import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../Node.react';
import languages from '../../../../languages';
import UIActions from '../../../../actions/UIActions';
import AppDispatcher from '../../../../dispatcher/AppDispatcher';
import AppConstants from '../../../../constants/AppConstants';
import wifiStore from '../../../../stores/wifiStore';
import './TextToSpeech.less';

class TextToSpeechNode extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {
      hasMicroKey: true
    };
    this.setMicroKey = this.setMicroKey.bind(this);
  }

  onConfigChange(conf) {
    console.log(conf);
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src='./img/icon-textToSpeech.png' />
        <span className="node-preview-name">{languages.getTranslation('sound-node-textToSpeech')}</span>
      </div>
    );
  }

  setMicroKey() {
    if (wifiStore.getWifiNetworkState() !== 'connected' || !localStorage.getItem('microCognitiveBingSpeech')) {
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
        <div className='node-body node-draggable' style={{
          backgroundImage: 'url("img/sound-textToSpeech.png")'}}>
        </div>
        {this.state.hasMicroKey === false ? <img className={'plaint'} src="./img/icon-node-plaint.png" alt=""/> : ''}
        <Inputs ports={this.props.info.props.in} nodeId={this.props.id}/>
        <Outputs ports={this.props.info.props.out} nodeId={this.props.id} />
        <Tools nodeId={this.props.id}/>
      </div>
    );
  }

  render() {
    return this.props.isPreview ? this.renderPreview() : this.renderActual();
  }

  componentDidMount() {
    if(this.props.id) {
      UIActions.initConfig(this.props.id);
    }
    this._register = AppDispatcher.register((action) => {
      if (action.actionType === AppConstants.SET_MICRO_NODE_INPUT) {
        this.setMicroKey();
      }
    });
  }

  componentWillUnmount() {
    AppDispatcher.unregister(this._register);
  }

}

export { TextToSpeechNode };