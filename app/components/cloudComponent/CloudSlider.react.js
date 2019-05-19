import React, { Component } from 'react';
import nodeStore from '../../stores/nodeStore';
import appStore from '../../stores/AppStore';
import Slider from 'rc-slider';
import UIActions from '../../actions/UIActions';
import tapOrClick from 'react-tap-or-click';
import 'rc-slider/assets/index.css';
import './cloudStyle.less';

class CloudSlider extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      name: this.props.name,
      value: this.props.action,
    };
    this.debounceTimer = '';
  }

  getValue(value){
    if(this.props.mode == 'edit-mode') {
      clearTimeout(this.debounceTimer);
      this.setState({
        value: value
      });
      this.debounceTimer = setTimeout(()=>{
        UIActions.configNode(this.props.id, {'state': parseInt(value)});
      }, 500);
    } else if(this.props.mode == 'preview-mode') {
      clearTimeout(this.debounceTimer);
      this.setState({
        value: value
      });
      this.debounceTimer = setTimeout(()=>{
        appStore.publishMQTTMessage(this.props.topic.state, String(value));
      }, 500);
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

  render() {
    return (
      <div className="project-style">
        <span className='cloudApp-desc-title' {...tapOrClick(this.changeName.bind(this))}>{this.state.name}</span>
        <span className="cloud-slider slider-value" >{this.state.value}</span>
        <div className='slider-cover'>
          <Slider onChange={this.getValue.bind(this)} value={this.state.value}/>
        </div>
      </div>);
  }

  updateSliderStatus(result) {
    if (result.id === this.props.id) {
      this.setState({
        value:Number(result.value)
      });
    }
  }

  MQTTHistory(data) {
    if(data.length != 0) {
      this.setState({
        value: JSON.parse(data[0])
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
      self.updateSliderStatusFunc = self.updateSliderStatus.bind(self);
      nodeStore.on('NodeOutputChange', self.updateSliderStatusFunc);
    }
  }
  componentWillUnmount(){
    if(this.props.mode == 'preview-mode') {
      appStore.off('history:' + this.props.topic.state, this.MQTTHistoryFunc);  
    } else if(this.props.mode == 'edit-mode') {
      nodeStore.off('NodeOutputChange', this.updateSliderStatusFunc);
    }
  }
}

export { CloudSlider };