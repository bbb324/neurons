import React, { Component, PureComponent } from 'react';
import tapOrClick from '../../utils/tapOrClick';
import UIActions from '../../actions/UIActions';
import AppDispatcher from '../../dispatcher/AppDispatcher';
import AppConstants from '../../constants/AppConstants';
import nodeStore from '../../stores/nodeStore';
import languages from '../../languages';
import './Node.less';
import './Node.mobile.less';

class Inputs extends PureComponent {
  constructor() {
    super(...arguments);
  }

  renderInputs(){
    let ports = this.props.ports.map((value, i) => {
      return (
        <div className='node-port-input node-port' key={i} id={this.props.nodeId+'-'+value} data-type='input'>
          <div className={'core ' +(this.props.showValue==true?'show':'')}>
            <span className="node-port-label">{this.props.showLabel==true?value: ''}</span>
            <span className="node-port-value"></span>
          </div>
        </div>
      );
    });
    return ports;
  }

  render() {
    return (
      <div className={'input-animate node-port-inputs '+'node-port-inputs-'+this.props.ports.length}>
        {this.renderInputs()}
      </div>
    );
  }
}

class Outputs extends Component {
  constructor() {
    super(...arguments);
  }
  renderOutputs(){
    let ports = this.props.ports.map((value) => {
      return (
        <div className='node-port-output node-port' key={value} id={this.props.nodeId+'-'+value} data-type='output'>
          <div className={'core'}>
            <span className="node-port-label"></span>
            <span className="node-port-value"></span>
          </div>
        </div>
      );
    });
    return ports;
  }

  render() {
    return (
      <div className={'out-animate node-port-outputs '+'node-port-outputs-'+this.props.ports.length}>
        {this.renderOutputs()}
      </div>
    );
  }

}

class Tools extends PureComponent {
  constructor() {
    super(...arguments);
    this._registerToken = '';
    this.state = {
      isActive: false,
      isDisconnected: !nodeStore.isElectronicNodeConnected(this.props.nodeId),
    };
  }


  deleteNode() {
    if(!this.props.isElectronic){
      UIActions.removeNode(this.props.nodeId);
      if(this.props.category == 'control' || this.props.category.indexOf('control') != -1) {
        UIActions.removeControlNode();
      }
    } else {
      UIActions.unUseNode(this.props.nodeId);
    }
  }

  disconnectNode(msg) {
    if(this.props.nodeId == msg.id) {
      this.setState({
        isDisconnected: msg.status === 'disconnected'
      });
    }
  }

  render() {
    return (
      <div className="node-tools">
        <div className={'tab-control ' + (this.state.isActive==true?'':'hide')}  {...tapOrClick(this.deleteNode.bind(this))}>
          <div className='tab-control-circle'>
            <i className='icon-delete'></i>
          </div>
        </div>
        <div className={'tab-mask node-draggable hide-config ' + ((this.state.isDisconnected && this.props.isElectronic) ?'':'hide')}>
          <span>{languages.getTranslation('node-status-disconnnected')}</span>
        </div>
      </div>
    );
  }

  componentDidMount() {
    let self = this;
    self._registerToken = AppDispatcher.register((action) => {
      if (action.actionType == AppConstants.GLOBAL_CANVAS_TOUCH) {
        if(self.state.isActive) {
          self.setState({
            isActive: false
          });
        }
      } else if(action.actionType == AppConstants.LONGPRESS_NODE) {
        if(!self.state.isActive) {
          self.setState({
            isActive: true
          });
        }
      } else if(action.actionType == AppConstants.BEGIN_MOVING_NODE_TO_CANVAS) {
        if(self.state.isActive) {
          self.setState({
            isActive: false
          });
        }
      }
    });

    this.disconnectNodeCB = this.disconnectNode.bind(this);
    nodeStore.on('NodeConnectionStatusChange', this.disconnectNodeCB);
  }

  componentWillUnmount() {
    let self = this;
    AppDispatcher.unregister(self._registerToken);
    nodeStore.off('NodeConnectionStatusChange', this.disconnectNodeCB);
  }

}


export { Inputs, Outputs, Tools};