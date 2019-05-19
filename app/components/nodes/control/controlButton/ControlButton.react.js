/**
 * Created by junxie on 2016/12/12.
 */

import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../Node.react';
import languages from '../../../../languages';
import {pressdown, pressup} from '../../../../utils/dom';
import UIActions from '../../../../actions/UIActions';
import nodeStore from '../../../../stores/nodeStore';
import tapOrClick from 'react-tap-or-click';
import AppDispatcher from '../../../../dispatcher/AppDispatcher';
import AppConstants from '../../../../constants/AppConstants';
require('./ControlButton.less');

class ControlButton extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {
      value: false,
      url: ''
    };
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} id={this.props.nodeId} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src="img/icon-controlButton.png" />
        <span className="node-preview-name">{languages.getTranslation('control-button')}</span>
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
      }} data-type={this.props.info.name} data-category={this.props.info.props.category} ref='controlButtonID'>
        <div className='node-body node-draggable hide-config' >
         <div className='node-actual-icon' ref='controlButton' style={{
           backgroundImage: this.state.url}}>
         </div>
         <span className='editer-gear' {...tapOrClick(this.EditName.bind(this))} style={{background:'url("img/icon-gear.png") center center / 20px no-repeat'}}></span>
        </div>
        <Inputs ports={this.props.info.props.in} nodeId={this.props.id} />
        <Outputs ports={this.props.info.props.out} nodeId={this.props.id} showValue={true}/>
        <Tools nodeId={this.props.id} category={this.props.info.props.category}/>
      </div>
    );
  }

  render() {
    return this.props.isPreview ? this.renderPreview() : this.renderActual();
  }

  pressdownHandle(){
    UIActions.configNode(this.props.id, {state: true});
  }

  pressupHandle(){
    UIActions.configNode(this.props.id, {state: false});
  }

  updateTapStatus(result) {
    if (result.id == this.props.id) {
      let value = false, url;
      if (Number(result.value).isNaN) {
        value = true;
      } else {
        value = Number(result.value) > 0;
      }
      switch (value) {
      case true:
        url = 'img/node-controlButton-active.png';
        break;
      case false:
        url = 'img/node-controlButton.png';
        break;
      }
      this.setState({
        value: value,
        url: 'url("' + url + '")'
      });
    }

  }

  componentDidMount(){
    let self = this;
    self.pressdownHandleFunc = self.pressdownHandle.bind(self);
    self.pressupHandleFunc = self.pressupHandle.bind(self);
    if(self.refs.controlButton) {
      self.refs.controlButton.addEventListener(pressdown, self.pressdownHandleFunc);
      self.refs.controlButton.addEventListener(pressup, self.pressupHandleFunc);
    }
    self.updateTapStatusFunc = self.updateTapStatus.bind(self);
    nodeStore.on('NodeOutputChange', self.updateTapStatusFunc);
    this._register = AppDispatcher.register((action)=>{
      if(action.actionType == AppConstants.EDITER_NODE_CONFIG) {
        if(self.props.id == action.nodeId) {
          self.refs.controlButton.style.background = self.updateTapStatus(self.state.value);
        }
      }
    });
  }

  componentWillUnmount(){
    let self = this;
    if(self.refs.controlButton) {
      self.refs.controlButton.removeEventListener(pressdown, self.pressdownHandleFunc);
      self.refs.controlButton.removeEventListener(pressup, self.pressupHandleFunc);
    }
    AppDispatcher.unregister(this._register);
    nodeStore.off('NodeOutputChange', self.updateTapStatusFunc);
  }   

}

export { ControlButton };
