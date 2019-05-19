import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../Node.react';
import languages from '../../../../languages';

require('./Segdisplay.less');

class SegdisplayNode extends PureComponent {
  constructor() {
    super(...arguments);
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-shelf node-type-' + this.props.info.name} id={this.props.nodeId} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src="img/icon-segdisplay.svg" />
        <span className="node-preview-name">{languages.getTranslation('hardware-node-segdisplay')}</span>
      </div>
    );
  }

  renderActual() {

    return (
      <div className={'node-actual node-type-' + this.props.info.name} id={this.props.id} style={{
        left: this.props.left + 'px',
        top: this.props.top + 'px'
      }} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <div className="node-body node-draggable hide-config">
          <div className='node-actual-body'>
            <img className="node-actual-icon" src="img/icon-segdisplay.svg" />
            <span className="node-actual-name">{languages.getTranslation('hardware-node-segdisplay')}</span>
          </div>
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

export { SegdisplayNode };
