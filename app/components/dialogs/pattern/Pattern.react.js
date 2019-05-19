/**
 * Created by junxie on 2016/10/11.
 */
import React, { Component } from 'react';
import tapOrClick from 'react-tap-or-click';
import UIActions from '../../../actions/UIActions';

//   黑0       红1          橙2        黄3       绿4         青5         蓝6         紫7        白8
const COLOR_LIST = ['#9DB0CE', '#FF0000', '#FFAF00', '#FFFF00', '#00FF00', '#00b9fc', '#1c62f9', '#D400FF', '#FFFFFF'];
const COLOR_BORDER_LIST = ['#e1ecfe', '#ff5a62', '#ffb773', '#ffffc2', '#c6ffc7', '#89e0fd', '#719efb', '#ff5af8', '#d6d6d6'];
class Pattern extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      curSelect: this.props.currentSelected
    };
  }

  LedSet() {
    /*self.props.pattern is the data passed in*/
    let self = this;
    if (self.props.pattern) {
      let data = self.props.pattern;
      let tmp = data.map(function (value, key) {
        if (key <= 7) {
          if (key == self.props.currentSelected) {
            return (
              <li className={'light lightList selected '+(key==7?' mid right': '')} key={key} data-color={value}
                  style={{backgroundColor: COLOR_LIST[value]}} {...tapOrClick(self.onClick.bind(self))}>
                <span className='selectLed' style={{border: '3px solid '+COLOR_BORDER_LIST[value]}}></span>
              </li>
            );
          } else {
            return (
              <li className={'light lightList '+(key==7?' mid right': '')} key={key} data-color={value}
                  style={{backgroundColor: COLOR_LIST[value]}} {...tapOrClick(self.onClick.bind(self))}>
                <span className='selectLed'></span>
              </li>
            );
          }
        } else {
          if (key == self.props.currentSelected) {
            return (
              <li className={'light lightList selected '+('right')} key={key} data-color={value}
                  style={{backgroundColor: COLOR_LIST[value]}} {...tapOrClick(self.onClick.bind(self))}>
                <span className='selectLed' style={{border: '3px solid '+COLOR_BORDER_LIST[value]}}></span>
              </li>
            );
          } else {
            return (
              <li className={'light right lightList'} key={key} data-color={value}
                  style={{backgroundColor: COLOR_LIST[value]}} {...tapOrClick(self.onClick.bind(self))}>
                <span className='selectLed'></span>
              </li>
            );
          }
        }
      });
      return tmp;
    }
  }

  /*set the selected led light*/
  onClick(e) {
    let ledIndex = Array.prototype.indexOf.call(e.currentTarget.parentNode.childNodes, e.currentTarget);
    let colorIndex = e.currentTarget.dataset.color;
    this.setState({
      curSelect: ledIndex
    });
    UIActions.setLedStripColor(Number(colorIndex), ledIndex);
  }

  /* add more led light*/
  add() {
    this.props.addLedCallback();
  }

  render() {
    let self = this;
    let classList = '';
    if (self.props.pattern) {
      let length = self.props.pattern.length;

      if (length < 7) {
        classList = 'light addLed icon-add';
      }
      //if equal to 7, set the 7th light to the mid position by add class 'mid'
      else if (length == 7) {
        classList = 'light mid addLed icon-add right';
      } else if (length > 7) {
        //if length equals to maximum lenght, then hide the add light button by add class 'hide'
        classList = length == 15 ? 'light right addLed icon-add hide' : 'light right addLed icon-add';
      }
    }
    return (
      <ul className='ledList'>
        {self.LedSet()}
        <li className={classList} {...tapOrClick(self.add.bind(self))}></li>
      </ul>);
  }
}

export { Pattern };