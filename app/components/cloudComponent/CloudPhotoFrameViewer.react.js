/**
 * Created by junxie on 17/4/13.
 */

import React, { Component } from 'react';
import nodeStore from '../../stores/nodeStore';
import appStore from '../../stores/AppStore';
import engine from '../../core/FlowEngine';
import languages from '../../languages';
require('./cloudStyle.less');

const getPictureUrl = (file) => {
  return 'http://'+engine.getWifiServerIp()+':8083/viewPhoto?'+new Date().getTime()+'&filename=' + file;
};

class CloudPhotoFrameViewer extends Component{
  constructor(){
    super(...arguments);
    this.state = {
      image: this.props.src
    };
  }

  updateInput(bundle) {
    if(bundle.id === this.props.id){
      if(bundle.value && bundle.value.type == 'snapshot') {
        this.setState({
          image: bundle.value.file,
        });
      }

    }
  }

  render(){
    return (
      <div className="project-style">
        <span className='cloudApp-desc-title'>{languages.getTranslation('photo-viewer')}</span>
        <div className='cloud-image'>
          <img src={this.state.image? getPictureUrl(this.state.image) : './img/photo-frame-empty.png'}/>
        </div>
      </div>);
  }

  MQTTMessage(message) {
    console.log(message);
    /*this.setState({
      value: tmpValue
    });*/
  }

  MQTTConnect() {
    if(this.props.topic) {
      this.topic = this.props.topic.text;
      appStore.subscribeMQTTTopic(this.topic);
    }
  }

  MQTTHistory(data) {
    if (data.length != 0) {
      let tmpValue = JSON.parse(data[0]);
      console.log(tmpValue);
    }
  }

  componentDidMount() {
    let self = this;
    if(self.props.mode == 'preview-mode') {
      self.topic = self.props.topic.text;
      self.MQTTConnectFunc = self.MQTTConnect.bind(self);
      appStore.on('connect', self.MQTTConnectFunc);
      self.MQTTMessageFunc = self.MQTTMessage.bind(self);
      appStore.on('message:' + self.topic, self.MQTTMessageFunc);

      self.MQTTHistoryFunc = self.MQTTHistory.bind(self);
      appStore.on('history:' + self.props.topic.text, self.MQTTHistoryFunc);

      appStore.getHistoryData(self.props.topic.text);
    } else if(self.props.mode == 'edit-mode') {
      self.updateInputFunc = self.updateInput.bind(self);
      nodeStore.on('NodeInputChange', self.updateInputFunc);
    }
  }

  componentWillUnmount() {
    if(this.props.mode == 'preview-mode') {
      appStore.off('connect', this.MQTTConnectFunc);
      appStore.off('message:' + this.topic, this.MQTTMessageFunc);
      appStore.off('history:' + this.props.topic.text, this.MQTTHistoryFunc);
    } else if(this.props.mode == 'edit-mode') {
      nodeStore.off('NodeInputChange', this.updateInputFunc);
    }
  }
}

export { CloudPhotoFrameViewer };
