/**
 * Created by junxie on 17/7/31.
 */
import React, { Component } from 'react';
import tapOrClick from 'react-tap-or-click';
import languages from '../../../languages';
import nodeStore from '../../../stores/nodeStore';
import {DigitSlider} from './DigitSlider.react';
require('./configurator.less');

class ColorCheck extends Component {
  constructor() {
    super(...arguments);
    this.defaultConf = {};
    this.state = {
      isActive: false,
      R: this.props.sampleColor!==null?this.props.sampleColor.R:0,
      G: this.props.sampleColor!==null?this.props.sampleColor.G:0,
      B:this.props.sampleColor!==null?this.props.sampleColor.B:0,
      tolerance: this.props.tolerance
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

  getToleranceValue(key, value){
    this.setState({
      tolerance: value
    });
    this.props.onChange && this.props.onChange(key, value);
  }

  render(){
    let R = this.state.R;
    let G = this.state.G;
    let B = this.state.B;
    let sampleColor = 'rgb' + '(' + R + ',' + G + ',' + B + ')';
    return (
      <div className={this.props.type+'-content'}>
        <div className="pick-color">
          <div className={this.state.type+'-title'}>{languages.getTranslation('takeColor')}</div>
          <div className='slider-color-div'>
            <div className='sampleColor' style={{background: sampleColor}}></div>
            <div className='takeColor' {...tapOrClick(this.takeColor.bind(this))}>{languages.getTranslation('takeColor')}</div>
          </div>
        </div>
        <div className="tolerance">
          <DigitSlider key={'tolerance'}
                       name={'tolerance'}
                       val={this.state.tolerance}
                       id={this.state.id}
                       type={this.state.type}
                       config={this.props.configs}
                       onChange={this.getToleranceValue.bind(this)}/>
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.props.onChange && this.props.onChange('tolerance', this.state.tolerance);
  }

}

export { ColorCheck };