import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../Node.react';
import languages from '../../../../languages';
import UIActions from '../../../../actions/UIActions';
import nodeStore from '../../../../stores/nodeStore';
import AppDispatcher from '../../../../dispatcher/AppDispatcher';
import AppConstants from '../../../../constants/AppConstants';

require('./Timer.less');

class TimerNode extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {
      value: this.props.info.props.configs.interval.defaultValue,
    };
    this.onConfigChange = this.onConfigChange.bind(this);
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src='./img/icon-timer.png' />
        <span className="node-preview-name">{languages.getTranslation('timer')}</span>
      </div>
    );
  }

  onConfigChange(conf) {
    this.setState({
      value: conf.interval
    });
  }

  renderActual() {
    return (
      <div className={'node-actual node-type-' + this.props.info.name} id={this.props.id} style={{
        left: this.props.left + 'px',
        top: this.props.top + 'px'
      }} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <div className='node-body node-draggable'>
          <div className='node-actual-body'>
            <span className="node-actual-interval">{languages.getTranslation('timer')}</span>
            <div className="node-interval-wrap">
              <span className={'node-actual-time '+((this.state.value>9999 || this.state.value<-9999)? 'hide-more': '')}>{this.state.value}</span>
              <span className='unit'>s</span>
            </div>
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

  componentDidMount() {
    if(this.props.id) {
      let value = nodeStore.getNodeConfigs(this.props.id).interval.defaultValue;
      if(value == null) {
        value = NaN;
      }
      this.setState({
        value: value
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

export { TimerNode };
