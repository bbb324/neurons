/**
 * Created by junxie on 2017/2/22.
 */

import React, { Component } from 'react';
import tapOrClick from 'react-tap-or-click';
import UIActions from '../../actions/UIActions';
import nodeStore from '../../stores/nodeStore';
import appStore from '../../stores/AppStore';
require('./cloudStyle.less');

class CloudButton extends Component{
  constructor(){
    super(...arguments);
    this.state = {
      name: this.props.name
    };
  }

  onStart(){
    this.changeStyle(true);
    if(this.props.mode == 'edit-mode') {
      UIActions.configNode(this.props.id, {state: true});
    } else if(this.props.mode == 'preview-mode') {
      appStore.publishMQTTMessage(this.props.topic.state, JSON.stringify(true));
    }
  }

  onEnd(){
    this.changeStyle(false);
    if(this.props.mode == 'edit-mode') {
      UIActions.configNode(this.props.id, {state: false});
    } else if(this.props.mode == 'preview-mode') {
      appStore.publishMQTTMessage(this.props.topic.state, JSON.stringify(false));
    }
  }

  changeName(){
    UIActions.editName(this.props.id, this.state.name, this.setName.bind(this));
  }

  setName(newName){
    this.setState({
      name: newName
    });
  }

  render(){
    return (
      <div className="project-style">
        <span className='cloudApp-desc-title' {...tapOrClick(this.changeName.bind(this))}>{this.state.name}</span>
        <div className='ctrl-btn-outter'
             onTouchStart={this.onStart.bind(this)}
             onTouchEnd={this.onEnd.bind(this)} ref='btn'>
          <div className='ctrl-btn'>
            <div className='ctrl-btn-inner display-name' data-name={this.state.name}><span className="ctrl-btn-name">ctrlbtn</span></div>
          </div>
        </div>
    </div>);
  }

  changeStyle(type) {
    if(type == true) {
      this.refs.btn.classList.add('ctrl-btn-outter-pressdown');
      let btn = this.refs.btn.querySelector('.ctrl-btn');
      btn.classList.add('ctrl-btn-pressdown');
      btn.querySelector('.ctrl-btn-inner').classList.add('ctrl-btn-inner-pressdown');
    } else {
      this.refs.btn.classList.remove('ctrl-btn-outter-pressdown');
      let btn = this.refs.btn.querySelector('.ctrl-btn');
      btn.classList.remove('ctrl-btn-pressdown');
      btn.querySelector('.ctrl-btn-inner').classList.remove('ctrl-btn-inner-pressdown');
    }

  }

  updateTapStatus(result) {
    let value = false;
    if (result.id === this.props.id) {
      if (Number(result.value).isNaN) {
        value = true;
      } else {
        value = Number(result.value) > 0;
      }
      this.changeStyle(value);
    }
  }

  componentDidMount(){
    let self = this;
    if(this.props.mode == 'edit-mode') {
      self.updateTapStatusFunc = self.updateTapStatus.bind(self);
      nodeStore.on('NodeOutputChange', self.updateTapStatusFunc);
    }
  }

  componentWillUnmount(){
    if(this.props.mode == 'edit-mode') {
      nodeStore.off('NodeOutputChange', this.updateTapStatusFunc);
    }
  }
}

export { CloudButton };
