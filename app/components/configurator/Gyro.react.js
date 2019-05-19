import { Select } from './Select.react';
import React, { Component } from 'react';
import tapOrClick from 'react-tap-or-click';
//import UIActions from '../../actions/UIActions';
require('./Configurator.less');

class Gyro extends Component {
  constructor() {
    super(...arguments);
    this.defaultConf = {};
    this.state = {
      isActive: false,
      type: this.props.configs.type.defaultValue,
      axis: this.props.configs.axis.defaultValue
    };
  }

  onConfigSelect(key, value){
    this.props.onChange && this.props.onChange(key, value);
    this.setState({
      type: value
    });
  }

  onAxisSelect(e) {
    if(this.state.type == 'shake'){
      return;
    }
    let axis = e.currentTarget.querySelector('.select-radio-label').textContent;
    this.props.onChange && this.props.onChange('axis', axis);
    this.setState({
      axis: axis
    });
  }

  render(){
    return (
      <div>
        <Select key={'type'} name={'type'} config={this.props.configs.type} selectStyle={this.props.selectStyle} onChange={this.onConfigSelect.bind(this)} />
        <div className={'select-radio-gyro ' + (this.state.type == 'shake'? 'select-radio-disabled': '')}>
          <div className={'select-radio ' + (this.state.axis == 'X'? 'radio-active': '')} {...tapOrClick(this.onAxisSelect.bind(this))}>
            <span className="select-radio-box">
              <span className="select-radio-dot"></span>
            </span>
            <span className="select-radio-label">X</span>
          </div>
          <div className={'select-radio ' + (this.state.axis == 'Y'? 'radio-active': '')} {...tapOrClick(this.onAxisSelect.bind(this))}>
            <span className="select-radio-box">
              <span className="select-radio-dot"></span>
            </span>
            <span className="select-radio-label">Y</span>
          </div>
          <div className={'select-radio ' + (this.state.axis == 'Z'? 'radio-active': '')} {...tapOrClick(this.onAxisSelect.bind(this))}>
            <span className="select-radio-box">
              <span className="select-radio-dot"></span>
            </span>
            <span className="select-radio-label">Z</span>
          </div>
        </div>
        
     </div>
    );
  }

  componentDidMount() {
    for ( let key in this.props.configs){
      if (this.props.configs[key].hasOwnProperty('defaultValue')){
        this.props.onChange && this.props.onChange( key, this.props.configs[key].defaultValue);
      }
    }
  }  

}

export { Gyro };