/**
 * Created by junxie on 17/7/20.
 */
import React, { Component } from 'react';
import tapOrClick from '../../../utils/tapOrClick';
import languages from '../../../languages';
require('./configurator.less');

const HOLD_TAB = [
  languages.getTranslation('hold until change'),
  languages.getTranslation('hold for time'),
  languages.getTranslation('change slowly')
];

class TabSwitch extends Component {
  constructor() {
    super(...arguments);
    this.body = [];
  }

  getType() {
    switch (this.props.type) {
    case 'HOLD':
      this.renderContent(HOLD_TAB);
      break;
    }
    return this.body;
  }

  selected(e) {
    console.log(e);
  }

  renderContent(tab_arr) {
    tab_arr.forEach((value)=> {
      this.body.push(<div className='tab-switch-div' {...tapOrClick(this.selected.bind(this))}>
        <span className='tab-switch-name' key={value}>{value}</span>
      </div>);
    });
  }
  render() {
    return (<div className='tab-switch-content'>
      {this.getType()}
    </div>);
  }
}

export { TabSwitch };