import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../Node.react';
import languages from '../../../../languages';
import UIActions from '../../../../actions/UIActions';
import nodeStore from '../../../../stores/nodeStore';
import AppDispatcher from '../../../../dispatcher/AppDispatcher';
import AppConstants from '../../../../constants/AppConstants';
require('./Function.less');

class FunctionNode extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {
      func: this.props.info.props.configs.func.defaultValue,
    };
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src='./img/icon-function.png' />
        <span className="node-preview-name">{languages.getTranslation('function')}</span>
      </div>
    );
  }

  onConfigChange(conf) {
    this.setState({
      func: conf.hasOwnProperty('func') ? conf.func : this.state.func,
    });
  }

  getIconUrl(){
    let url;
    switch (this.state.func) {
    case 'square':
      url = (<div className='node-actual-icon'>
        <img src='./img/node-function-square-icon.png'/>
      </div>);
      break;
    case 'sqrt':
      url = (<div className='node-actual-icon'>
        <img src='./img/node-function-root-icon.png'/>
      </div>);
      break;
    case 'abs':
      url = (<div className='node-actual-icon'>
        <img src='./img/node-function-abs-icon.png'/>
      </div>);
      break;
    case '-':
      url = (<div className='node-actual-icon'>
        <img src='./img/node-function-negative-icon.png'/>
      </div>);
      break;
    case 'ln':
      url = (<div className='node-actual-icon'>
        <img src='./img/node-function-ln-icon.png'/>
      </div>);
      break;
    case 'log10':
      url = (<div className='node-actual-icon'>
        <img src='./img/node-function-log10-icon.png'/>
      </div>);
      break;
    case 'e^':
      url = (<div className='node-actual-icon'>
        <img src='./img/node-function-exp-icon.png'/>
      </div>);
      break;
    case '10^':
      url = (<div className='node-actual-icon'>
        <img src='./img/node-function-10x-icon.png'/>
      </div>);
      break;
    case 'sin':
      url = (<div className='node-actual-icon'>{'sin'}</div>);
      break;
    case 'cos':
      url = (<div className='node-actual-icon'>{'cos'}</div>);
      break;
    case 'tan':
      url = (<div className='node-actual-icon'>{'tan'}</div>);
      break;
    case 'asin':
      url = (<div className='node-actual-icon'>{'asin'}</div>);
      break;
    case 'acos':
      url = (<div className='node-actual-icon'>{'acos'}</div>);
      break;
    case 'atan':
      url = (<div className='node-actual-icon'>{'atan'}</div>);
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
          {this.getIconUrl()}
        </div> 
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
    if(this.props.id) {
      this.setState({
        func: nodeStore.getNodeConfigs(this.props.id).func.defaultValue
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

export { FunctionNode };