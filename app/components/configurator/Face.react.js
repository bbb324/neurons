import { Select } from './Select.react';
import React, { Component } from 'react';
import tapOrClick from 'react-tap-or-click';
import languages from '../../languages';
require('./Configurator.less');

class Face extends Component {
  constructor() {
    super(...arguments);
    this.defaultConf = {};
    this.state = {
      isActive: false,
      faceId: this.props.configs.faceId.defaultValue,
      blink: this.props.configs.blink.defaultValue
    };
  }

  onConfigSelect(key, value){
    this.props.onChange && this.props.onChange(key, value);
    this.setState({
      faceId: value
    });
  }

  onBlinkSelect(e) {
    let blink = e.currentTarget.dataset.value;
    this.props.onChange && this.props.onChange('blink', blink);
    this.setState({
      blink: blink
    });
  }

  render(){
    return (
      <div>
        <Select key={'faceId'} name={'faceId'} config={this.props.configs.faceId} selectStyle={this.props.selectStyle} onChange={this.onConfigSelect.bind(this)} />
        <div className={'select-radio-face'}>
          <div className={'select-radio ' + (this.state.blink == 'blink'? 'radio-active': '')} {...tapOrClick(this.onBlinkSelect.bind(this))} data-value='blink'>
            <span className="select-radio-box">
              <span className="select-radio-dot"></span>
            </span>
            <span className="select-radio-label">{languages.getTranslation('blink')}</span>
          </div>
          <div className={'select-radio ' + (this.state.blink == 'not blink'? 'radio-active': '')} {...tapOrClick(this.onBlinkSelect.bind(this))} data-value='not blink'>
            <span className="select-radio-box">
              <span className="select-radio-dot"></span>
            </span>
            <span className="select-radio-label">{languages.getTranslation('not-blink')}</span>
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

export { Face };