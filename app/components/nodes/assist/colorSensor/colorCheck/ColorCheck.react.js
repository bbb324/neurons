import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../../Node.react';
import languages from '../../../../../languages';
import UIActions from '../../../../../actions/UIActions';
import nodeStore from '../../../../../stores/nodeStore';
import AppDispatcher from '../../../../../dispatcher/AppDispatcher';
import AppConstants from '../../../../../constants/AppConstants';
import './ColorCheck.less';

class ColorCheckNode extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {
      R: this.props.info.props.configs.sampleColor.defaultValue!==null?this.props.info.props.configs.sampleColor.defaultValue.R:0,
      G: this.props.info.props.configs.sampleColor.defaultValue!==null?this.props.info.props.configs.sampleColor.defaultValue.G:0,
      B: this.props.info.props.configs.sampleColor.defaultValue!==null?this.props.info.props.configs.sampleColor.defaultValue.B:0
    };   
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src='./img/icon-colorCheck.png' />
        <span className="node-preview-name">{languages.getTranslation('colorcheck')}</span>
      </div>
    );
  }

  onConfigChange(conf) {
    if ( (conf.hasOwnProperty('sampleColor')) && (conf.sampleColor!==null)) {
      let newState = {};
      if(conf.sampleColor.hasOwnProperty('R')) {
        newState.R = conf.sampleColor.R;
      }
      if(conf.sampleColor.hasOwnProperty('G')) {
        newState.G = conf.sampleColor.G;
      }   
      if(conf.sampleColor.hasOwnProperty('B')) {
        newState.B = conf.sampleColor.B;
      }       
      this.setState(newState); 
    }
  }

  takeColor(){
    let id = this.props.id;
    let port = 'color';
    let color = nodeStore.getNodeInputValue(id,port);
    if ((typeof(color) === 'object') && (color !== null) && (color.hasOwnProperty('R')) && (color.hasOwnProperty('G')) && (color.hasOwnProperty('B'))){
      let newState = {};
      newState.R = color.R;
      newState.G = color.G;
      newState.B = color.B;
      this.setState(newState);
      UIActions.configNode(this.props.id, {'sampleColor': {R: color.R, G: color.G, B: color.B}}, true);
    }
  }

  renderActual() {
    let R = this.state.R;
    let G = this.state.G;
    let B = this.state.B;
    let sampleColor = 'rgb' + '(' + R + ',' + G + ',' + B + ')';    
    return (
      <div className={'node-actual node-type-' + this.props.info.name} id={this.props.id} style={{
        left: this.props.left + 'px',
        top: this.props.top + 'px'
      }} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <div className='node-body node-draggable'>
          <div className='node-actual-body'>
            <div className="colorCheck">{languages.getTranslation('colorcheck')}</div>
            <div className="color" style={{background: sampleColor}}></div>
          </div>
        </div>
        <Inputs ports={this.props.info.props.in} nodeId={this.props.id} />
        <Outputs ports={this.props.info.props.out} nodeId={this.props.id} showValue={true}/>
        <Tools nodeId={this.props.id} />
      </div>
    );
  }

  render() {
    return this.props.isPreview ? this.renderPreview() : this.renderActual();
  }
  componentDidMount() {
    if(this.props.id){
      if(this.props.info.props.configs.sampleColor.defaultValue === null){
        this.takeColor();
      }else {
        this.setState({
          R:nodeStore.getNodeConfigs(this.props.id).sampleColor.defaultValue.R,
          G:nodeStore.getNodeConfigs(this.props.id).sampleColor.defaultValue.G,
          B:nodeStore.getNodeConfigs(this.props.id).sampleColor.defaultValue.B
        });
      }
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

export { ColorCheckNode };
