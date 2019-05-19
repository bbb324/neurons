/**
 * Created by junxie on 17/6/28.
 */
import React, { Component } from 'react';
import tapOrClick from 'react-tap-or-click';
import UIActions from '../../actions/UIActions';
import languages from '../../languages';
import commonStore from '../../stores/commonStore';
import engine from '../../core/FlowEngine';

require('./Configurator.less');

class SequenceSetting extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      reRender: false,
      ports: this.props.configs,
      num: '',
      repeat: this.props.configs.repeat.defaultValue
    };
  }

  openDelaySecondInput() {
    let self = this;
    UIActions.openNumberInputDialog((num) => {
      this.setState({
        num: Number(num)
      });
      self.props.onChange && self.props.onChange(self.props.portId, Number(num));
    });
  }
  switcher() {
    let value = this.state.repeat == true? false: true;
    this.setState({
      repeat: value
    });
    this.props.onChange && this.props.onChange('repeat', value);
  }

  render() {
    return (
        <div className='sequence-config'>
          <div className="header">
            <span className={'label-txt'}>{languages.getTranslation('sequence-second')}</span>
            <span className={'number'} {...tapOrClick(this.openDelaySecondInput.bind(this))}>{this.state.num}s</span>
          </div>
          <div className='footer'>
           <span className='label-txt'>{languages.getTranslation('sequence-repeat')}</span>
            <div className={'switch-bar-div '+ (this.state.repeat == true? 'repeat':'')} {...tapOrClick(this.switcher.bind(this))}>
              <span className={'switch-bar-btn '}></span>
              <span className="switch-bar"></span>
            </div>
          </div>
        </div>
    );
  }
  showPort(portId) {
    this.setState({
      num: engine.getNodeCurrentConfig(this.props.id, portId) || 1
    });
  }

  componentDidMount() {
    this.showPortFunc = this.showPort.bind(this);
    commonStore.on('showPortConfig', this.showPortFunc);
    for (let key in this.props.configs) {
      if (this.props.configs[key].hasOwnProperty('defaultValue')) {
        this.props.onChange && this.props.onChange(key, this.props.configs[key].defaultValue);
      }
    }
  }

  componentWillUnmount() {
    commonStore.off('showPortConfig', this.showPortFunc);
  }

}

export { SequenceSetting };