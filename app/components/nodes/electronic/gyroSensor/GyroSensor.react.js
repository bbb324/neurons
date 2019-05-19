import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../Node.react';
import UIActions from '../../../../actions/UIActions';
import AppDispatcher from '../../../../dispatcher/AppDispatcher';
import AppConstants from '../../../../constants/AppConstants';
import nodeStore from '../../../../stores/nodeStore';
require('./GyroSensor.less');

class GyroSensorNode extends PureComponent {
  constructor() {
    super(...arguments);

    this.type = this.props.info.props.configs.type.defaultValue;
    this.axis = this.props.info.props.configs.axis.defaultValue;
    this.adjustStyle = this.adjustStyle.bind(this);
  }

  adjustStyle() {
    if(this.refs.node) {
      let core = this.refs.node.querySelector('.core');
      let coreLabel = this.refs.node.querySelector('.core .node-port-label');
      let coreValue = this.refs.node.querySelector('.core .node-port-value');
      let type = nodeStore.getCurrentConfig(this.props.id, 'type') || this.props.info.props.configs.type.defaultValue;
      let axis = nodeStore.getCurrentConfig(this.props.id, 'axis') || this.props.info.props.configs.axis.defaultValue;
      coreValue.textContent = '';
      if(type === 'shake') {
        core.classList.add('round');
      } else {
        core.classList.remove('round');
      }
      if(type !== 'shake' && axis) {
        coreLabel.textContent = axis;
      } else {
        coreLabel.textContent = '';
      }
    }
  }

  onConfigChange(conf) {
    if( conf.type ) {
      this.type = conf.type;
    }
    if( conf.axis ) {
      this.axis = conf.axis;
    }
    
    this.adjustStyle();
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-shelf node-type-' + this.props.info.name} id={this.props.nodeId} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src="img/icon-gyroSensor.png" />
      </div>
    );
  }

  renderActual() {
    return (
      <div className={'node-actual node-type-' + this.props.info.name} id={this.props.id} style={{
        left: this.props.left + 'px',
        top: this.props.top + 'px'
      }} data-type={this.props.info.name} data-category={this.props.info.props.category} ref="node">
        <div className='node-body node-draggable' style={{
          backgroundImage: 'url("img/electronic-gyroSensor.png")'}}>
        </div>
        <Inputs ports={this.props.info.props.in} nodeId={this.props.id} />
        <Outputs ports={this.props.info.props.out} nodeId={this.props.id} showValue={true} />
        <Tools nodeId={this.props.id} isElectronic={true} />
      </div>
    );
  }

  render() {
    return this.props.isPreview ? this.renderPreview() : this.renderActual();
  }

  componentDidMount() {
    if(this.props.id) {
      UIActions.initConfig(this.props.id);
      this.adjustStyle();
    }
    this._register = AppDispatcher.register((action) => {
      if (action.actionType === AppConstants.EDITER_NODE_CONFIG) {
        if(action.nodeId === this.props.id) {
          this.onConfigChange(action.conf);
        }
      }
    });
  }

  componentWillUnmount() {
    AppDispatcher.unregister(this._register);
  }
}

export { GyroSensorNode };