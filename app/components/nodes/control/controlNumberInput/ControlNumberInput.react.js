import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../Node.react';
import languages from '../../../../languages';
import tapOrClick from 'react-tap-or-click';
import UIActions from '../../../../actions/UIActions';
import nodeStore from '../../../../stores/nodeStore';
require('./ControlNumberInput.less');

class ControlNumberInputNode extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {
      value: ''
    };
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} id={this.props.nodeId} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src="img/icon-controlNumberInput.png" />
        <span className="node-preview-name">{languages.getTranslation('control-number-input')}</span>
      </div>
    );
  }

  EditName(){
    UIActions.editName(this.props.id, nodeStore.getCurrentConfig(this.props.id, 'name'));
  }

  renderActual() {
    return (
      <div className={'node-actual node-type-' + this.props.info.name} id={this.props.id} style={{
        left: this.props.left + 'px',
        top: this.props.top + 'px'
      }} data-type={this.props.info.name} data-category={this.props.info.props.category} ref='numberInput'>
        <div className='node-body node-draggable' >
          <span className='editer-gear hide-config' {...tapOrClick(this.EditName.bind(this))} style={{background:'url("img/icon-gear.png") center center / 20px no-repeat'}}></span>
          <div className="node-actual-title">{languages.getTranslation('control-number-input')}</div>
          <div className="node-actual-content">
            <div className="value-display" ref='num' >{this.state.value}</div>
          </div>
        </div>
        <Inputs ports={this.props.info.props.in} nodeId={this.props.id} />
        <Outputs ports={this.props.info.props.out} nodeId={this.props.id} />
        <Tools nodeId={this.props.id} category={this.props.info.props.category}/>
      </div>
    );
  }

  render() {
    return this.props.isPreview ? this.renderPreview() : this.renderActual();
  }

  updateNumber(result) {
    if (result.id === this.props.id) {
      this.setState({
        value: Number(result.value)
      });
    }
  }

  componentDidMount() {
    let self = this;
    if(this.props.id) {
      let config = nodeStore.getNodeConfigs(this.props.id);
      self.setState({
        value: config.number.defaultValue
      });
      UIActions.initConfig(this.props.id);
    }
    self.updateNumberFunc = self.updateNumber.bind(self);
    nodeStore.on('NodeOutputChange', self.updateNumberFunc);
  }

  componentWillUnmount() {
    nodeStore.off('NodeOutputChange', this.updateNumberFunc);
  }

}

export { ControlNumberInputNode };
