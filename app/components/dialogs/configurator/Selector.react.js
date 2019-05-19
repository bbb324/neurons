import React, { Component } from 'react';
import tapOrClick from '../../../utils/tapOrClick';
import nodeStore from '../../../stores/nodeStore';
import SelectFactory from './SelectFactory.js';
import languages from '../../../languages';
import UIActions from '../../../actions/UIActions';

class Selector extends Component {

  constructor() {
    super(...arguments);
    this.body = [];
    this.state = {
      selection: this.props.val
    };
    this.list = this.props.config.options;
  }

  getType() {
    let content = '';
    switch (this.props.type) {
    case 'COMPARE':
    case 'COMPUTE':
    case 'EMOTION_TEST':
    case 'FACE':
    case 'TEXT':
      content = this.renderContent(SelectFactory[this.props.type]);
      break;
    case 'HOLD':
    case 'ROUND':
      content = this.renderContent(SelectFactory[this.props.type], 'text');
      break;
    case 'VOICECOMMAND':
      content = this.renderContent(this.list, 'keyIsText');
      break;
    case 'ACCELEROMETER_GYRO':
      content = this.renderContent(SelectFactory[this.props.type][this.props.name], 'text');
      break;
    case 'FUNCTION':
    case 'PULSE':
      content = this.renderContent(this.list, 'noTranslation');
      break;
    case 'COLOR':
      content = this.renderContent(SelectFactory[this.props.type], 'color');
      break;
    default:
      content = this.renderContent(this.list, 'noTranslation');
      break;
    }
    return content;
  }

  selected(e) {
    let val = e.currentTarget.dataset.value;
    this.setState({
      selection: val
    });
    let type = this.props.type;
    if(type === 'COMPARE' || type === 'COMPUTE') {
      UIActions.setIconWithOption(this.props.id, e.currentTarget.dataset.value);
    }
    if(type === 'COLOR' && Number(val) === 8) {
      val = 0;
    }
    this.props.onChange && this.props.onChange(this.props.name, val);
  }

  renderContent(img_arr, type) {
    let self = this;
    let body = [];
    // if render type is text, return text, if render type null, return image
    if(type === 'text') {
      for(let index in img_arr) {
        body.push(<div className={'selector-'+ self.props.type + ' ' +(this.state.selection == img_arr[index].key? 'selected':'')} data-value={img_arr[index].key} key={img_arr[index].key} {...tapOrClick(self.selected.bind(self))}>
          <span>{img_arr[index].value}</span>
        </div>);
      }
    }else if(type === 'noTranslation') {
      for(let index in img_arr) {
        body.push(<div className={'selector-'+ self.props.type + ' ' +(this.state.selection == img_arr[index]? 'selected':'')} data-value={img_arr[index]} key={img_arr[index]} {...tapOrClick(self.selected.bind(self))}>
          <span>{img_arr[index]}</span>
        </div>);
      }
    } else if(type === 'color') {
      for(let index in img_arr) {
        body.push(<div className={'selector-'+ self.props.type} data-value={img_arr[index].key} key={img_arr[index].key} {...tapOrClick(self.selected.bind(self))}>
          <span className={'display-color '} style={{background: img_arr[index].value}}></span>
          <img className='color-selected' style={{display: (this.state.selection == img_arr[index].key? 'block':'none')}} src='./img/icon-color-selected.png' />
        </div>);
      }
    } else if(type === 'keyIsText') {
      for(let index in img_arr) {
        body.push(<div className={'selector-'+ self.props.type + ' ' +(this.state.selection == img_arr[index]? 'selected':'')} data-value={img_arr[index]} key={img_arr[index]} {...tapOrClick(self.selected.bind(self))}>
          <span>{languages.getTranslation(img_arr[index])}</span>
        </div>);
      }
    }
    else {
      for(let index in img_arr) {
        let img_src = img_arr[index].value;
        if(this.state.selection == img_arr[index].key && this.props.type !== 'EMOTION_TEST') {
          img_src = img_src.replace('.png', '-active.png');
        }
        body.push(<div className={'selector-'+ self.props.type + ' ' +(this.state.selection == img_arr[index].key? 'selected':'')} data-value={img_arr[index].key} key={img_arr[index].key} {...tapOrClick(self.selected.bind(self))}>
          <img className='selector-img' src={img_src} />
        </div>);
      }
    }

    return body;
  }

  selectorDisplay() {
    let element = this.refs.array.querySelector('[data-value="'+this.state.selection+'"]');
    if(element) {
      let digitalDiv = this.refs.array.parentNode.querySelectorAll('.calculator-content');
      let digitalTitle = this.refs.array.parentNode.querySelector('.calculator-title');
      switch (element.dataset.value) {
      case 'hold for time':{
        digitalDiv[0].style.display = 'block';
        digitalDiv[1].style.display = 'none';
        digitalTitle.textContent = languages.getTranslation('time');
        break;
      }
      case 'hold until change':
        digitalDiv[0].style.display = 'none';
        digitalDiv[1].style.display = 'none';
        break;
      case 'change slowly':
        digitalDiv[0].style.display = 'block';
        digitalDiv[1].style.display = 'none';
        digitalTitle.textContent = languages.getTranslation('hold-max-amplitude');
        break;
      case 'shake':
        this.refs.array.parentNode.querySelectorAll('.selector-content')[1].style.display = 'none';
        break;
      case 'angle':
      case 'acceleration':
        this.refs.array.parentNode.querySelectorAll('.selector-content')[1].style.display = 'block';
        break;
      }
    }

  }

  render() {
    return (<div className="selector-content" ref='array'>
      <div className="selector-title">{languages.getTranslation('configDialog-select')}</div>
      {this.getType()}
    </div>);
  }

  componentDidMount() {
    this.selectorDisplay();
    let value = nodeStore.getCurrentConfig(this.props.id, this.props.name);
    if(value != null) {
      this.setState({
        selection: value
      });
    }
    this.props.onChange && this.props.onChange(this.props.name, this.state.selection);
  }

  componentDidUpdate() {
    this.selectorDisplay();
  }
}

export { Selector };