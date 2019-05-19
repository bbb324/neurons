import React, { Component } from 'react';
import tapOrClick from 'react-tap-or-click';
import UIActions from '../../actions/UIActions';

class NumberInput extends Component {
  constructor() {
    super(...arguments);
  }

  openNumberInput() {
    console.log('open number');
    UIActions.openNumberInputDialog((num) => {
      this.refs.num.textContent = Number(num);
      this.props.onChange && this.props.onChange(this.props.name, Number(num));
    });
  }

  render() {
    return (
      <div ref='num' className={'number-' + this.props.numberStyle} {...tapOrClick(this.openNumberInput.bind(this))}>{this.props.config.defaultValue}</div>
    );
  }
}

export { NumberInput };