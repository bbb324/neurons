/**
 * Created by junxie on 2017/2/22.
 */

import React, { Component } from 'react';
import nodeStore from '../../stores/nodeStore';
import appStore from '../../stores/AppStore';
import tapOrClick from 'react-tap-or-click';
import UIActions from '../../actions/UIActions';
require('./cloudStyle.less');

class CloudIndicator extends Component{
  constructor(){
    super(...arguments);
    this.state = {
      value: '',
      name: this.props.name,
      id: this.props.id
    };
  }

  updateInput(bundle) {
    if(bundle.id === this.props.id){
      let value = JSON.parse(bundle.value);
      if(isNaN(Number(value))) {
        value = true;
      } else {
        value = Number(value) > 0;
      }
      this.setState({
        value: value,
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

  setColor() {
    let color = '';
    if(isNaN(Number(this.props.action))) {
      color = true;
    } else {
      color = Number(this.props.action) > 0;
    }
    this.setState({
      value: color
    });
  }

  render(){
    return (
      <div className="project-style">
        <span className='cloudApp-desc-title' {...tapOrClick(this.changeName.bind(this))}>{this.state.name}</span>
        <div className='cloud-light'>
          <div className={'oval-inner '+(this.state.value==true? 'green': 'red')}></div>
        </div>
    </div>);
  }

  /*
  *   if is Boolean, return '1', '0'
  *   if is Number, return '37'
  *   if is String, return 'abc'
  * */
  MQTTHistory(data) {
    if (data.length != 0) {
      let color = JSON.parse(data[0]);
      if(isNaN(Number(color))) {
        color = true;
      } else {
        color = Number(color) > 0;
      }
      this.setState({
        value: color,
      });
    }
  }

  MQTTMessage(message) {
    let color;
    if(isNaN(Number(JSON.parse(message)))) {
      color = false;
    } else {
      color = Number(JSON.parse(message)) > 0;
    }
    this.setState({
      value: color
    });
  }

  MQTTConnect() {
    if(this.props.topic) {
      this.topic = this.props.topic.input;
      appStore.subscribeMQTTTopic(this.topic);
    }
  }

  componentDidMount() {
    let self = this;
    if(self.props.mode == 'preview-mode') {
      self.MQTTHistoryFunc = self.MQTTHistory.bind(self);
      appStore.on('history:' + self.props.topic.input, self.MQTTHistoryFunc);

      self.MQTTConnectFunc = self.MQTTConnect.bind(self);
      appStore.on('connect', self.MQTTConnectFunc);

      self.MQTTMessageFunc = self.MQTTMessage.bind(self);
      appStore.on('message:' + self.props.topic.input, self.MQTTMessageFunc);

      appStore.getHistoryData(self.props.topic.input);
    } else if(self.props.mode == 'edit-mode') {
      self.updateInputFunc = self.updateInput.bind(self);
      nodeStore.on('NodeInputChange', self.updateInputFunc);
      self.setColor();
    }
  }

  componentWillUnmount() {
    if(this.props.mode == 'preview-mode') {
      appStore.off('history:' + this.props.topic.input, this.MQTTHistoryFunc);
      appStore.off('message:' + this.props.topic.input, this.MQTTMessageFunc);
      appStore.off('connect', this.MQTTConnectFunc);
    } else if(this.props.mode == 'edit-mode') {
      nodeStore.off('NodeInputChange', this.updateInputFunc);
    }
  }
}

export { CloudIndicator };
