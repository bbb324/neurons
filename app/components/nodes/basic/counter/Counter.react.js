import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../Node.react';
import tapOrClick from 'react-tap-or-click';
import UIActions from '../../../../actions/UIActions';
import languages from '../../../../languages';
import nodeStore from '../../../../stores/nodeStore';
//import { Configurator } from '../../../configurator/Configurator.react';
//import {ConfigBodyStyle, ConfigNumberStyle} from '../../../configurator/configStyle';
require('./Counter.less');

class CounterNode extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {
      value: 0
    };
  }

  onReset() {
    UIActions.configNode(this.props.id, {reset: 'reset'});
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src='./img/icon-counter.png' />
        <span className="node-preview-name">{languages.getTranslation('counter')}</span>
      </div>
    );
  }

  renderActual() {
    return (
      <div className={'node-actual node-type-' + this.props.info.name} id={this.props.id} style={{
        left: this.props.left + 'px',
        top: this.props.top + 'px'
      }} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <div className='node-body node-draggable'>
           <div className='node-actual-body'>
            <span className="counter-title">{languages.getTranslation('counter')}</span>
            <span className="counter-value">{this.state.value}</span>
            <span className="counter-reset hide-config" {...tapOrClick(this.onReset.bind(this))}>{languages.getTranslation('reset')}</span>
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
        value: bundle.value
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

export { CounterNode };
