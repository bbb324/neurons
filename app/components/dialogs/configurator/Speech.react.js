import React, { Component } from 'react';
//import NumberInput from 'react-number-input';
import tapOrClick from 'react-tap-or-click';
import languages from '../../../languages';
import UIActions from '../../../actions/UIActions';
import engine from '../../../core/FlowEngine';
require('./configurator.less');

class Speech extends Component {
  constructor() {
    super(...arguments);
  }

  playEffect(){
    this.refs.text.blur();
    engine.configNode(this.props.id, {text: this.refs.text.value});
    UIActions.configNode(this.props.id, {test: true});
  }

  change() {
    let val = this.refs.text.value;
    this.props.onChange && this.props.onChange(this.props.name, val);
  }
  render() {
    return (<div className={'text-content number-' + this.props.type}>
      <div className='text-title'>{languages.getTranslation('please input content')}</div>
      <input
        className='text-input'
        type="text"                      // optional, input[type]. Defaults to "tel" to allow non numeric characters
        onChange={this.change.bind(this)}
        ref='text'
      />
      <div className="play-wrap">
        <img className="play" {...tapOrClick(this.playEffect.bind(this))} src='./img/speech-play.png' />
      </div>
    </div>);
  }

  componentDidMount() {
    this.refs.text.value = this.props.val;
    this.props.onChange && this.props.onChange(this.props.name, this.props.val);
  }
}

export { Speech };