import React, { Component } from 'react';
import UIActions from '../../actions/UIActions';
import tapOrClick from 'react-tap-or-click';
import nodeStore from '../../stores/nodeStore';
import appStore from '../../stores/AppStore';
require('./cloudStyle.less');

class CloudText extends Component{
  constructor(){
    super(...arguments);
    this.state = {
      text: this.props.action,
      name: this.props.name
    };
  }
  editText(event){
    UIActions.setTextInput(this.props.id, event.currentTarget.textContent, this.setText.bind(this));
  }

  changeName(){
    UIActions.editName(this.props.id, this.state.name, this.setName.bind(this));
  }

  setText(newText){
    this.setState({
      text: newText
    });
  }

  setName(newName){
    this.setState({
      name: newName
    });
  }

  renderInput() {
    if(this.props.mode == 'edit-mode') {
      return <span className="cloud-text-input ">{this.state.text}</span>;
    } else {
      let style={
        width: '208px',
        border: 'none',
        height: '80px'
      };
      return <input type='text' style={style} className="cloud-text-input" value={this.state.text} ref='input' onChange={this.handleChange.bind(this)} onKeyPress={this.passData.bind(this)}></input>;
    }
  }

  handleChange(e) {
    this.setState({
      text: e.target.value
    });
  }

  passData(e) {
    if(e.key == 'Enter') {
      this.topic = this.props.topic.text;
      appStore.publishMQTTMessage(this.topic, JSON.stringify(this.state.text));
      this.refs.input.blur();
    }
  }
  
  render(){
    return (
      <div className="project-style">
        <span className='cloudApp-desc-title cloud-text-name' {...tapOrClick(this.changeName.bind(this))}>{this.state.name}</span>
      <div className='cloud-text' {...tapOrClick(this.editText.bind(this))} >
        {this.renderInput()}
      </div>
    </div>);
  }

  updateText(result) {
    if (result.id === this.props.id) {
      this.setState({
        text: result.value
      });
    }
  }

  MQTTHistory(data) {
    if(data.length != 0) {
      this.setState({
        text: data[0]
      });
    }
  }

  componentDidMount(){
    let self = this;
    if(self.props.mode == 'preview-mode') {
      self.MQTTHistoryFunc = self.MQTTHistory.bind(self);
      appStore.on('history:' + self.props.topic.text, self.MQTTHistoryFunc);
      appStore.getHistoryData(self.props.topic.text);
    } else if(self.props.mode == 'edit-mode') {
      self.updateTextFunc = self.updateText.bind(self);
      nodeStore.on('NodeOutputChange', self.updateTextFunc);
    }
  }

  componentWillUnmount(){
    if(this.props.mode == 'preview-mode') {
      appStore.off('history:' + this.props.topic.text, this.MQTTHistoryFunc);
    } else if(this.props.mode == 'edit-mode') {
      nodeStore.off('NodeOutputChange', this.updateTextFunc);
    }
  }
}

export { CloudText };