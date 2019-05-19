/**
 * Created by junxie on 17/7/31.
 */
import React, { PureComponent } from 'react';
import Slider from 'rc-slider';
import nodeStore from '../../../stores/nodeStore';
import languages from '../../../languages';
import 'rc-slider/assets/index.css';

require('./configurator.less');

class DigitSlider extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {
      value: this.props.val
    };
    this.debounceTimer = '';
  }

  getValue(value){
    let self = this;
    clearTimeout(this.debounceTimer);
    this.setState({
      value: parseInt(value)
    });
    this.debounceTimer = setTimeout(()=>{
      self.update();
    }, 500);
  }

  update() {
    this.props.onChange && this.props.onChange(this.props.name, Number(this.state.value));
  }

  render() {
    return (<div className={'slider-content number-' + this.props.type}>
      <div className='slider-title'>{languages.getTranslation(this.props.name)}</div>
      <div className="slider-wrap">
        <div className="slider-value">{this.state.value}</div>
        <Slider onChange={this.getValue.bind(this)} value={this.state.value}/>
      </div>
    </div>);
  }

  componentDidMount() {
    let value = nodeStore.getCurrentConfig(this.props.id, this.props.name);
    if(value != null) {
      this.setState({
        value: value
      });
    }
    this.update();
  }
}

export { DigitSlider };