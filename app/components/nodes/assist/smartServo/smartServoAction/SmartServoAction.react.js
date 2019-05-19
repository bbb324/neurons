import React, { PureComponent } from 'react';
import { Configurator } from '../../../../configurator/Configurator.react';
import {SelectStyle, SmartServo} from '../../../../configurator/configStyle';
import languages from '../../../../../languages';
import {Inputs, Outputs, Tools} from '../../../Node.react';

require('./SmartServoAction.less');

class SmartServoAction extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {
      angle: '90',
      speed: '40',
      delay: '0',
      no: '1',
      moveType: 'move to'
    };
  }

  onConfigChange(conf) {
    let newState = {};
    if(conf.hasOwnProperty('angle')) {
      newState.angle = conf.angle;
    }
    if(conf.hasOwnProperty('speed')) {
      newState.speed = conf.speed;
    }
    if(conf.hasOwnProperty('delay')) {
      newState.delay = conf.delay;
    }
    if(conf.hasOwnProperty('no')) {
      newState.no = conf.no;
    }
    if(conf.hasOwnProperty('moveType')) {
      newState.moveType = conf.moveType;
    }
    console.log('servoAciton', newState);
    this.setState(newState);
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} id={this.props.nodeId} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src="img/electronic-smartServoAction.png" />
        <span className="node-preview-name">{languages.getTranslation('smart-servo')}</span>
      </div>
    );
  }

  renderActual() {
    return (
      <div className={'node-actual node-type-' + this.props.info.name} id={this.props.id} style={{
        left: this.props.left + 'px',
        top: this.props.top + 'px'
      }} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <div className='node-body node-draggable' style={{
          background: 'url("img/electronic-smartServoAction-bg.png") center center no-repeat',
          backgroundSize: 'cover'
        }}>
          <div className="servo-no">NO.{this.state.no}</div>
          {this.state.moveType === 'keep moving' ? <div className="speed">{this.state.speed}<span>rpm</span></div> : <div className="angle"><span className="angleNo">{this.state.angle}</span><img src="./img/icon-degree-number.png" alt=""/></div>}
          <div className="delay">for {this.state.delay}s</div>
        </div>
        <Inputs ports={this.props.info.props.in} nodeId={this.props.id} />
        <Outputs ports={this.props.info.props.out} nodeId={this.props.id} />
        <Configurator
          onConfigChange={this.onConfigChange.bind(this)}
          nodeId={this.props.id}
          type={this.props.info.name}
          selectStyle={SelectStyle.SMARTSERVOACTION}
          bodyStyle={SmartServo.SMARTSERVOACTION}/>
        <Tools nodeId={this.props.id} />
      </div>
    );
  }

  render() {
    return this.props.isPreview ? this.renderPreview() : this.renderActual();
  }

}

export { SmartServoAction };