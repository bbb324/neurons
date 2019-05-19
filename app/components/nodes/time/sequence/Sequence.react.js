import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../Node.react';
import languages from '../../../../languages';
import tapOrClick from '../../../../utils/tapOrClick';
import commonStore from '../../../../stores/commonStore';
import nodeStore from '../../../../stores/nodeStore';
import UIActions from '../../../../actions/UIActions';
import engine from '../../../../core/FlowEngine';
import AppDispatcher from '../../../../dispatcher/AppDispatcher';
import AppConstants from '../../../../constants/AppConstants';
import { WireUtils } from '../../../editer/WireUtils';

require('./Sequence.less');

class SequenceNode extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {
      portNumber: this.props.info.props.out.length
    };
    this.minPortNumber = 1;
    this.maxPortNumber = 6;
    this.portHeight = 4.67;
    this.ports = nodeStore.getNodeConfigs(this.props.id);
    this.insertPortId = '';
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src='./img/icon-sequence.png'/>
        <span className="node-preview-name">{languages.getTranslation('sequence')}</span>
      </div>
    );
  }

  renderPorts() {
    let ports = [];
    this.portsNameArray = [];
    delete this.ports['lastSend'];

    for(let port in this.ports) {
      if(port == 'repeat') continue;
      this.portsNameArray.push(port);
      let value = this.ports[port].defaultValue == null? NaN : this.ports[port].defaultValue;
      ports.push(<div className='seq-node' id={port} key={port}>
        <span className='txt'>{value}s</span>
      </div>);
    }
    return ports;
  }

  renderActual() {
    let bodyHeight = this.state.portNumber >=this.maxPortNumber? (this.maxPortNumber+1)* this.portHeight: (this.state.portNumber+1) * this.portHeight;
    return (
      <div className={'node-actual node-type-' + this.props.info.name} id={this.props.id} style={{
        left: this.props.left + 'px',
        top: this.props.top + 'px',
        height:bodyHeight+'vh'
      }} data-type={this.props.info.name} data-category={this.props.info.props.category} >
        <div className='node-body node-draggable' style={{height: bodyHeight+'vh'}}>
          <div className='node-actual-body' ref='sequenceBody'>
            {this.renderPorts()}
            <span className="seq-subtract hide-config" {...tapOrClick(this.deletePort.bind(this))}>
              <img src="./img/compute/icon-subtract.png" alt="" />
            </span>
            <span className="seq-add hide-config" {...tapOrClick(this.addPort.bind(this))}>
              <img src="./img/compute/icon-addition.png" alt="" />
            </span>
          </div>
        </div>
        <Inputs ports={this.props.info.props.in} nodeId={this.props.id} />
        <Outputs ports={this.portsNameArray} nodeId={this.props.id} showValue={true}/>
        <Tools nodeId={this.props.id} />
      </div>
    );
  }

  render() {
    return this.props.isPreview ? this.renderPreview() : this.renderActual();
  }

  onConfigChange(param) {
    let arr = Object.keys(param);
    for(let index of arr) {
      let el = this.refs.sequenceBody.querySelector('[id="' + index + '"] .txt');
      if(el) {
        el.textContent = param[index]+'s';
      }
    }
  }

  addPort() {
    if(this.state.portNumber === this.maxPortNumber) return;
    UIActions.sequenceNodeEvent('add', this.props.id);
  }

  deletePort() {
    if(this.state.portNumber === this.minPortNumber) return;
    let num = this.state.portNumber;
    num = num - 1;
    this.setState({
      portNumber: num
    });
    let ports = Object.keys(nodeStore.getNodeConfigs(this.props.id));
    UIActions.sequenceNodeEvent('delete', this.props.id, ports[ports.length-1]);
  }

  portAdd(param, wires) {
    if(param.nodeId == -1) return;
    this.remainWires = wires;
    this.insertPortId = param.portId;
    if(param.nodeId == this.props.id) {
      let portLength = this.getArrayLength();
      this.setState({
        portNumber: portLength
      });
    }
  }

  portDel(nodeId, remainWires) {
    if(nodeId == this.props.id) {
      this.remainWires = remainWires;
      let portLength = this.getArrayLength();
      this.setState({
        portNumber: portLength
      });
    }
  }

  getArrayLength() {
    let array = nodeStore.getNodeConfigs(this.props.id);
    delete array['repeat'];
    return Object.keys(array).length;
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevState.portNumber != this.state.portNumber) {
      let param = commonStore.getCanvasStatus();
      WireUtils.setWirePosition(this.remainWires, param);
      if (this.insertPortId != '') {
        engine.initNodePort(this.props.id, this.insertPortId);
        this.insertPortId = '';
      }
    }
  }

  componentDidMount(){
    if (this.props.id) {
      UIActions.initConfig(this.props.id);
      let length = this.getArrayLength();
      this.setState({
        portNumber: length
      });
      this._register = AppDispatcher.register((action) => {
        if (action.actionType === AppConstants.EDITER_NODE_CONFIG) {
          if(action.nodeId === this.props.id) {
            this.onConfigChange(action.conf);
          }
        }
      });
    }
    this.portAddFunc = this.portAdd.bind(this);
    this.portDelFunc = this.portDel.bind(this);
    commonStore.on('sequencePortAdd', this.portAddFunc);
    commonStore.on('deletePort', this.portDelFunc);

  }
  componentWillUnmount(){
    commonStore.off('sequencePortAdd', this.portAddFunc);
    commonStore.off('deletePort', this.portDelFunc);
    if(this.props.id) {
      AppDispatcher.unregister(this._register);
    }
  }

}

export { SequenceNode };
