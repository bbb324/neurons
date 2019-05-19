import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../Node.react';
import languages from '../../../../languages';
import nodeStore from '../../../../stores/nodeStore';
import UIActions from '../../../../actions/UIActions';
import AppDispatcher from '../../../../dispatcher/AppDispatcher';
import AppConstants from '../../../../constants/AppConstants';
require('./Pulse.less');

class Pulse extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {
      func: this.props.info.props.configs.func.defaultValue,
      wavelength: this.props.info.props.configs.wavelength.defaultValue,
      amplitude: this.props.info.props.configs.amplitude.defaultValue,
    };
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} data-type={this.props.info.name} data-category={this.props.info.props.category}>
       <img className="node-preview-icon" src='./img/icon-pulse.png' />
        <span className="node-preview-name">{languages.getTranslation('pulse')}</span>
      </div>
    );
  }

  onConfigChange(conf) {
    let newState = {};
    if(conf.hasOwnProperty('func')) {
      newState.func = conf.func;
    }
    if(conf.hasOwnProperty('wavelength')) {
      newState.wavelength = conf.wavelength;
    }
    if(conf.hasOwnProperty('amplitude')) {
      newState.amplitude = conf.amplitude;
    }  
    this.setState(newState);
  } 

  getIconUrl(){
    let url;
    switch (this.state.func) {
    case 'sin':
      url = './img/pulse-sin.png';
      break;
    case 'square':
      url = './img/pulse-square.png';
      break;
    case 'triangle':
      url = './img/pulse-triangle.png';
      break;
    }
    return url;
  }

  renderActual() {
    return (
      <div className={'node-actual node-type-' + this.props.info.name} id={this.props.id} style={{
        left: this.props.left + 'px',
        top: this.props.top + 'px'
      }} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <div className='node-body node-draggable' >
         <div className='node-actual-icon' style={{
           backgroundImage: 'url("'+ this.getIconUrl() +'")'}}>
         </div>     
        </div> 
        <Inputs ports={this.props.info.props.in} nodeId={this.props.id}/>
        <Outputs ports={this.props.info.props.out} nodeId={this.props.id}  showValue={true}/>
        <Tools nodeId={this.props.id}/>
      </div>
    );
  }

  render() {
    return this.props.isPreview ? this.renderPreview() : this.renderActual();
  }

  componentDidMount() {
    if(this.props.id) {
      let dataset = nodeStore.getNodeConfigs(this.props.id);
      this.setState({
        func: dataset.func.defaultValue,
        wavelength: dataset.wavelength.defaultValue,
        amplitude: dataset.amplitude.defaultValue,
      });
      UIActions.initConfig(this.props.id);
      this._register = AppDispatcher.register((action) => {
        if (action.actionType === AppConstants.EDITER_NODE_CONFIG) {
          if(action.nodeId === this.props.id) {
            this.onConfigChange(action.conf);
          }
        }
      });
    }
  }

  componentWillUnmount() {
    if(this.props.id) {
      AppDispatcher.unregister(this._register);
    }
  }
  
}

export { Pulse };
