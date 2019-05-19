import React, { Component } from 'react';
import UIActions from '../../actions/UIActions';
import nodeStore from '../../stores/nodeStore';
import appStore from '../../stores/AppStore';
import tapOrClick from 'react-tap-or-click';
require('./cloudStyle.less');

class CloudNumber extends Component{
  constructor(){
    super(...arguments);
    this.state = {
      number: this.props.action,
      name: this.props.name
    };
  }
  openNumberInput() {
    if(this.props.mode == 'edit-mode') {
      UIActions.openNumberInputDialog((num) => {
        this.setState({
          number: Number(num)
        });
        UIActions.configNode(this.props.id, {number: Number(num)});
      });
    } else if(this.props.mode == 'preview-mode') {
      UIActions.openNumberInputDialog((num) => {
        this.setState({
          number: Number(num)
        });
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

  renderInput() {
    if(this.props.mode == 'edit-mode') {
      return <span className='cloud-text-input'>{this.state.number}</span>;
    } else {
      let style={
        width: '208px',
        border: 'none',
        height: '80px',
        textAlign: 'center'
      };
      return <input type='number' style={style} className="cloud-text-input" value={this.state.number} ref='input' onChange={this.handleChange.bind(this)} onKeyPress={this.passData.bind(this)}></input>;
    }
  }

  handleChange(e) {
    if((/\d+/g).exec(e.target.value) || e.target.value == '') {
      this.setState({
        number: e.target.value
      });
    }
  }

  passData(e) {
    if(e.key == 'Enter') {
      this.topic = this.props.topic.number;
      appStore.publishMQTTMessage(this.topic, JSON.stringify(this.state.number));
      this.refs.input.blur();
    }
  }

  render(){
    return (
      <div className="project-style">
        <span className='cloudApp-desc-title cloud-text-name' {...tapOrClick(this.changeName.bind(this))}>{this.state.name}</span>
      <div className='cloud-number' {...tapOrClick(this.openNumberInput.bind(this))}>
        {this.renderInput()}
      </div>
    </div>);
  }

  updateNumber(result) {
    if (result.id === this.props.id) {
      this.setState({
        number: Number(result.value)
      });
    }
  }

  MQTTHistory(data) {
    if(data.length != 0) {
      this.setState({
        number: JSON.parse(data[0])
      });
    }
  }

  componentDidMount() {
    let self = this;
    if(self.props.mode == 'preview-mode') {
      self.MQTTHistoryFunc = self.MQTTHistory.bind(self);
      appStore.on('history:' + self.props.topic.number, self.MQTTHistoryFunc);
      appStore.getHistoryData(self.props.topic.number);
    } else if(self.props.mode == 'edit-mode') {
      self.updateNumberFunc = self.updateNumber.bind(self);
      nodeStore.on('NodeOutputChange', self.updateNumberFunc);
    }
  }

  componentWillUnmount() {
    if(this.props.mode == 'preview-mode') {
      appStore.off('history:' + this.props.topic.number, this.MQTTHistoryFunc);
    } else if(this.props.mode == 'edit-mode') {
      nodeStore.off('NodeOutputChange', this.updateNumberFunc);
    }
  }
}

export { CloudNumber };