import React, { Component } from 'react';
import tapOrClick from 'react-tap-or-click';
import languages from '../../languages';
import nodeStore from '../../stores/nodeStore';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
require('./Configurator.less');

class ColorCheck extends Component {
  constructor() {
    super(...arguments);
    this.defaultConf = {};
    this.state = {
      isActive: false,
      R: this.props.configs.sampleColor.defaultValue!==null?this.props.configs.sampleColor.defaultValue.R:0,
      G: this.props.configs.sampleColor.defaultValue!==null?this.props.configs.sampleColor.defaultValue.G:0,
      B:this.props.configs.sampleColor.defaultValue!==null?this.props.configs.sampleColor.defaultValue.B:0,
      tolerance: this.props.configs.tolerance.defaultValue
    };
  }

  takeColor(){
    let id = this.props.id;
    let port = 'color';
    let color = nodeStore.getNodeInputValue(id,port);
    if ((typeof(color) === 'object') && (color !== null) && (color.hasOwnProperty('R')) && (color.hasOwnProperty('G')) && (color.hasOwnProperty('B'))){
      let newState = {};
      newState.R = color.R;
      newState.G = color.G; 
      newState.B = color.B;
      this.setState(newState);
      this.props.onChange && this.props.onChange('sampleColor', {R: color.R, G: color.G, B: color.B});  
    }   
  }

  getToleranceValue(value){
    this.setState({
      tolerance: value
    });
    this.props.onChange && this.props.onChange('tolerance', value);  
  } 

  render(){  
    let R = this.state.R;
    let G = this.state.G;
    let B = this.state.B;
    let sampleColor = 'rgb' + '(' + R + ',' + G + ',' + B + ')';
    return (
      <div>
        <div className="sampleColor" style={{background: sampleColor}}></div>
        <div className="takeColor" {...tapOrClick(this.takeColor.bind(this))}>{languages.getTranslation('takeColor')}</div>
        <div className="tolerance">
          <span className="toleranceSetting">{languages.getTranslation('tolerance')}</span>
          <span className="slider-value">{this.state.tolerance}</span>
          <Slider onChange={this.getToleranceValue.bind(this)} value={this.state.tolerance}/>
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
    if (this.props.configs.sampleColor.defaultValue === null){
      this.takeColor();
    }
  }  

}

export { ColorCheck };