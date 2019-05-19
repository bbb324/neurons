import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../Node.react';
import languages from '../../../../languages';
import nodeStore from '../../../../stores/nodeStore';
import tapOrClick from 'react-tap-or-click';
import UIActions from '../../../../actions/UIActions';

require('./Random.less');

class Random extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {
      number: 0,
      from: this.props.info.props.configs.from.defaultValue,
      to: this.props.info.props.configs.to.defaultValue,
    };   
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src='./img/icon-random.png' />
        <span className="node-preview-name">{languages.getTranslation('random')}</span>
      </div>
    );
  }

  onConfigChange(conf) {
    let newState = {};
    if(conf.hasOwnProperty('from')) {
      newState.from = conf.from;
    }
    if(conf.hasOwnProperty('to')) {
      newState.to = conf.to;
    }
    this.setState(newState); 
  } 

  onTrigger(e) {
    UIActions.configNode(this.props.id, {trigger: 'trigger'});
    e.stopPropagation();
    e.target.closest('.node-type-RANDOM').classList.add('no-deleteBtn-display');
  }

  renderActual() {
    return (
      <div className={'node-actual node-type-' + this.props.info.name} id={this.props.id} style={{
        left: this.props.left + 'px',
        top: this.props.top + 'px'
      }} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <div className='node-body node-draggable'>
           <div className='node-actual-body'>
            <span className="random-title">{languages.getTranslation('random')}</span>
            <span className="random-value">{this.state.number}</span>    
            <span className="random-trigger" {...tapOrClick(this.onTrigger.bind(this))}>{languages.getTranslation('trigger')}</span>
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
      UIActions.initConfig(this.props.id);
    }
    this.nodeOutPutChangeFunc = this.nodeOutPutChange.bind(this);
    nodeStore.on('NodeOutputChange', this.nodeOutPutChangeFunc);
  }
  componentWillUnmount(){
    nodeStore.off('NodeOutputChange', this.nodeOutPutChangeFunc);
  }
  
}

export { Random };
