import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../Node.react';
import UIActions from '../../../../actions/UIActions';
import './VoiseRecognition.less';

class VoiseRecognitionNode extends PureComponent {
  constructor() {
    super(...arguments);
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-shelf node-type-' + this.props.info.name} id={this.props.nodeId} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src="img/icon-voiceRecognition.png" />
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
            backgroundImage: 'url("img/electronic-voiceRecognition.png")'}}>
          </div>
        <Inputs ports={this.props.info.props.in} nodeId={this.props.id} />
        <Outputs ports={this.props.info.props.out} nodeId={this.props.id}/>
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
    }
  }
  
}

export { VoiseRecognitionNode };