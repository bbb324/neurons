import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../Node.react';
import nodeStore from '../../../../stores/nodeStore';
import './Ledpanel.less';

class LedpanelNode extends PureComponent {
  constructor() {
    super(...arguments);
  }

  getDefaultSelected(){
    let configs = nodeStore.getNodeConfigs(this.props.id);
    return configs.selected.defaultValue;
  }

  getEditImage(){
    let configs = nodeStore.getNodeConfigs(this.props.id);
    return configs.editImage.defaultValue;
  } 

  renderPreview() {
    return (
      <div className={'node-preview node-preview-shelf node-type-' + this.props.info.name} id={this.props.nodeId} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src="img/led-matrix.png" />
      </div>
    );
  }
  
  renderActual() {
    return (
      <div className={'node-actual node-type-' + this.props.info.name} id={this.props.id} style={{
        left: this.props.left + 'px',
        top: this.props.top + 'px'
      }} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <div className='node-body node-draggable hide-config' style={{
          backgroundImage: 'url("img/electronic-led-matrix.png")'}}>
        </div>
        <Inputs ports={this.props.info.props.in} nodeId={this.props.id} />
        <Outputs ports={this.props.info.props.out} nodeId={this.props.id} />
        <Tools nodeId={this.props.id} isElectronic={true} />
      </div>
    );
  }

  render() {
    return this.props.isPreview ? this.renderPreview() : this.renderActual();
  }
  
}

export { LedpanelNode };