import React, { Component } from 'react';
import languages from '../../../languages';
import tapOrClick from '../../../utils/tapOrClick';
import './configurator.less';

class Toggle extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      value: this.props.flag
    };
    this.getTranslationKey = this.getTranslationKey.bind(this);
    this.setConfig = this.setConfig.bind(this);
  }

  getTranslationKey() {
    let type = this.props.type;
    let key = '';
    if(type === 'FACE') {
      key = 'blink';
    }else{
      key = 'sequence-repeat';
    }
    return key;
  }

  render() {
    return (<div className='toggle-content'>
      <div className='toggle-title'>{languages.getTranslation(this.getTranslationKey())}</div>
      <div className='toggle-div'>
        <div className={'toggle-cover ' + (this.state.value==true? 'on':'off')} {...tapOrClick(this.toggle.bind(this))}
             ref='cover'>
          <div className='toggle-inner'></div>
        </div>
      </div>
    </div>);
  }

  setConfig(boolean) {
    if(this.props.type === 'FACE') {
      this.props.onChange && this.props.onChange(this.props.name, (boolean === false ? 'not blink' : 'blink'));
    }else {
      this.props.onChange && this.props.onChange(this.props.name, boolean);
    }
  }

  toggle() {
    let result = this.state.value;
    this.setState({
      value: result === false ? true : false
    });
    setTimeout(() => {
      this.setConfig(this.state.value);
    }, 0);
  }

  componentDidMount() {
    this.setConfig(this.props.flag);
  }
}

export { Toggle };