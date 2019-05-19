import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../Node.react';
import languages from '../../../../languages';
import UIActions from '../../../../actions/UIActions';
import nodeStore from '../../../../stores/nodeStore';
import AppDispatcher from '../../../../dispatcher/AppDispatcher';
import AppConstants from '../../../../constants/AppConstants';

require('./Scale.less');

class ScaleNode extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {
      minin: this.props.info.props.configs.minin.defaultValue,
      maxin: this.props.info.props.configs.maxin.defaultValue,
      minout: this.props.info.props.configs.minout.defaultValue,
      maxout: this.props.info.props.configs.maxout.defaultValue 
    };   
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src='./img/icon-scale.png' />
        <span className="node-preview-name">{languages.getTranslation('scale')}</span>
      </div>
    );
  }

  onConfigChange(conf) {
    let newState = {};
    if(conf.hasOwnProperty('minin')) {
      newState.minin = conf.minin;
    }
    if(conf.hasOwnProperty('maxin')) {
      newState.maxin = conf.maxin;
    }
    if(conf.hasOwnProperty('minout')) {
      newState.minout = conf.minout;
    }
    if(conf.hasOwnProperty('maxout')) {
      newState.maxout = conf.maxout;
    }    
    this.setState(newState);
  } 

  renderActual() {
    return (
      <div className={'node-actual node-type-' + this.props.info.name} id={this.props.id} style={{
        left: this.props.left + 'px',
        top: this.props.top + 'px'
      }} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <div className='node-body node-draggable'>
           <div className='node-actual-body'>
            <span className="scale-title">{languages.getTranslation('scale')}</span>
             <span className="scale-in ewq">(<span className='show-number'>{this.state.minin}</span>-<span
               className='show-number'>{this.state.maxin}</span>)</span>
            <img className="scale-arrow" src='./img/scale-arrow.png' />
             <span className="scale-out">(<span className='show-number'>{this.state.minout}</span>-<span
               className='show-number'>{this.state.maxout}</span>)</span>
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

  nodeOutPutChange(bundle){
    if(this.props.id == bundle.id){
      this.setState({
        number: bundle.value
      });
    }
  }

  componentDidMount(){
    if(this.props.id) {
      let configs = nodeStore.getNodeConfigs(this.props.id);
      this.setState({
        minin: configs.minin.defaultValue,
        maxin: configs.maxin.defaultValue,
        minout: configs.minout.defaultValue,
        maxout: configs.maxout.defaultValue
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
    this.nodeOutPutChangeFunc = this.nodeOutPutChange.bind(this);
    nodeStore.on('NodeOutputChange', this.nodeOutPutChangeFunc);
  }
  componentWillUnmount(){
    if(this.props.id) {
      AppDispatcher.unregister(this._register);
    }
    nodeStore.off('NodeOutputChange', this.nodeOutPutChangeFunc);
  }
  
}

export { ScaleNode };
