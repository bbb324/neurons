/**
 * Created by junxie on 17/7/20.
 */
import React, { Component } from 'react';
//import NumberInput from 'react-number-input';
import languages from '../../../languages';
require('./configurator.less');

class TextInput extends Component {
  constructor() {
    super(...arguments);
    this.getTranslationKey = this.getTranslationKey.bind(this);
  }

  change() {
    let val = this.refs.text.value;
    this.props.onChange && this.props.onChange(this.props.name, val);
  }

  getTranslationKey() {
    switch (this.props.type) {
    case 'MATCHTEXT':
      return 'find-text';
    case 'SAVERECORD':
      return 'fileName';
    default:
      return 'edit-text';
    }
  }

  render() {
    return (<div className={'text-content number-' + this.props.type}>
      <div className='text-title'>{languages.getTranslation(this.getTranslationKey())}</div>
      <input
        className='text-input'
        type="text"                      // optional, input[type]. Defaults to "tel" to allow non numeric characters
        onChange={this.change.bind(this)}
        ref='text'
      />
    </div>);
  }

  componentDidMount() {
    this.refs.text.value = this.props.val;
    this.props.onChange && this.props.onChange(this.props.name, this.props.val);
  }
}

export { TextInput };