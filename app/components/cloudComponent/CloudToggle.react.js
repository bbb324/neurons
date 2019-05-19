/**
 * Created by junxie on 2017/2/22.
 */

import React, { Component } from 'react';
import tapOrClick from 'react-tap-or-click';
import UIActions from '../../actions/UIActions';
import nodeStore from '../../stores/nodeStore';
import appStore from '../../stores/AppStore';
require('./cloudStyle.less');

class CloudToggle extends Component{
  constructor(){
    super(...arguments);
    this.state = {
      action: this.props.action,
      name: this.props.name
    };
  }
  switchTab(){
    let bool = this.state.action == false? true: false;
    if(this.props.mode == 'edit-mode') {
      UIActions.configNode(this.props.id, {'state': bool});
    } else if(this.props.mode == 'preview-mode') {
      appStore.publishMQTTMessage(this.props.topic.state, JSON.stringify(bool));
      this.setState({
        action: bool
      });
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
      <div className='project-style'>
        <span className='cloudApp-desc-title' {...tapOrClick(this.changeName.bind(this))}>{this.state.name}</span>
      <div className='toggle-bg ' style={{background: this.state.action==true?'#09f1ff':''}} {...tapOrClick(this.switchTab.bind(this))}>
        <span className='toggle-txt' style={{textAlign: this.state.action==true?'left':'right'}}>{this.state.action == true? 'ON': 'OFF'}</span>
				<div className={'cloud-btn '+ (this.state.action==true?'switchONOFF':'')}>
            <div className="cloud-btn-inner"></div>
        </div>
      </div>
    </div>);
  }

  updateToggle(result) {
    if (result.id === this.props.id) {
      let value = JSON.parse(result.value);
      this.setState({
        action: value
      });
    }
  }

  MQTTHistory(data) {
    if(data.length != 0) {
      this.setState({
        action: JSON.parse(data[0])
      });
    }
  }

  componentDidMount(){
    let self = this;
    if(self.props.mode == 'preview-mode') {
      self.MQTTHistoryFunc = self.MQTTHistory.bind(self);
      appStore.on('history:' + self.props.topic.state, self.MQTTHistoryFunc);
      appStore.getHistoryData(self.props.topic.state);
    } else if(self.props.mode == 'edit-mode') {
      self.updateToggleFunc = self.updateToggle.bind(self);
      nodeStore.on('NodeOutputChange', self.updateToggleFunc);
    }
  }

  componentWillUnmount(){
    if(this.props.mode == 'preview-mode') {
      appStore.off('history:' + this.props.topic.state, this.MQTTHistoryFunc);
    } else if(this.props.mode == 'edit-mode') {
      nodeStore.off('NodeOutputChange', this.updateToggleFunc);
    }
  }
}

export { CloudToggle };
