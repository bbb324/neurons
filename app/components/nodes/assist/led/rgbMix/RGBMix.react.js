import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../../Node.react';
import languages from '../../../../../languages';

require('./RGBMix.less');


class RGBMixNode extends PureComponent {
  constructor() {
    super(...arguments);
  } 

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} id={this.props.nodeId} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src="img/icon-rgbMix.png" />
        <span className="node-preview-name">{languages.getTranslation('assistance-node-rgbMix')}</span>
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
          background: 'url("img/icon-rgbMix.png") center center / 88px no-repeat'}}>
        </div>
        <Inputs ports={this.props.info.props.in} nodeId={this.props.id} showValue={true} showLabel={true}/>
        <Outputs ports={this.props.info.props.out} nodeId={this.props.id} />
        <Tools nodeId={this.props.id} />
      </div>
    );
  }

  render() {
    return this.props.isPreview ? this.renderPreview() : this.renderActual();
  }
  
}

export { RGBMixNode };