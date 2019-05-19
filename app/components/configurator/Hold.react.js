import { Select } from './Select.react';
import React, { Component } from 'react';
import tapOrClick from 'react-tap-or-click';
import UIActions from '../../actions/UIActions';
import languages from '../../languages';
require('./Configurator.less');

class Hold extends Component {
  constructor() {
    super(...arguments);
    this.defaultConf = {};
    this.state = {
      isActive: false,
      type: this.props.configs.type.defaultValue,
      time: this.props.configs.time.defaultValue,
      amplitude: this.props.configs.amplitude.defaultValue
    };
  }

  onConfigSelect(key, value){
    this.props.onChange && this.props.onChange(key, value);
    this.setState({
      type: value
    });   
  }

  openHoldTimeNumberInput() {
    if (this.state.type==='hold for time'){
      UIActions.openNumberInputDialog((num) => {
        this.setState({
          time: Number(num)
        });  
        this.props.onChange && this.props.onChange('time', Number(num));
      });
    }
  } 

  openAmplitudeNumberInput() {
    if (this.state.type==='change slowly'){
      UIActions.openNumberInputDialog((num) => {
        this.setState({
          amplitude: Number(num)
        }); 
        this.props.onChange && this.props.onChange('amplitude', Number(num));
      });
    }
  }   

  render(){
    return (
      <div>
        <Select key={'type'} name={'type'} config={this.props.configs.type} selectStyle={this.props.selectStyle} onChange={this.onConfigSelect.bind(this)} />
        <div className="row-section">
          <span className={'holdTime ' + (this.state.type!='hold for time'?'translucent':'')}>{languages.getTranslation('hold-time')}</span>
          <div className={'number-hold ' + (this.state.type!='hold for time'?'translucent':'')} {...tapOrClick(this.openHoldTimeNumberInput.bind(this))}>{this.state.time}</div>
          <span className={'second ' + (this.state.type!='hold for time'?'translucent':'')}>s</span>
        </div>
        <div className="row-section">
          <span className={'amplitude ' + (this.state.type!='change slowly'?'translucent':'')}>{languages.getTranslation('hold-max-amplitude')}</span>
          <div className={'number-hold ' + (this.state.type!='change slowly'?'translucent':'')} {...tapOrClick(this.openAmplitudeNumberInput.bind(this))}>{this.state.amplitude}</div>
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

export { Hold };