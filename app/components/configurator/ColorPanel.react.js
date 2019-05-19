import React, { Component } from 'react';
import tapOrClick from 'react-tap-or-click';
import AppDispatcher from '../../dispatcher/AppDispatcher';
import AppConstants from '../../constants/AppConstants';
class ColorPanel extends Component {
  constructor() {
    super(...arguments);
    this.colorArray = ['#d50022', '#f8a443', '#f8e653', '#77d24b', '#3ce3c4', '#35619d', '#9325f3', '#FFFFFF'];
    this.state = {
      selected: this.props.selected
    };
  }

  initState(key) {
    // key=0 : white 
    let realKey = (key + 1) == 8 ? 0 : (key + 1);
    return ( Number(this.state.selected) === realKey) ? '' : 'hide';
  }

  onSelect(e) {
    this.props.onChange && this.props.onChange(this.props.name, e.currentTarget.dataset.value);
    let selectList = e.currentTarget.closest('.color-list').querySelectorAll('.selectedColor');
    for (let i = 0; i < selectList.length; i++) {
      if (selectList[i].classList.contains('hide') == false) {
        selectList[i].classList.add('hide');
      }
    }
    e.currentTarget.querySelector('.selectedColor').classList.remove('hide');
  }

  colorList() {
    let colorBoard = this.colorArray.map((value, key) => {
      return (
        <li key={key} className='color-card' data-value={(key+1)==8?0:(key+1)}
            style={{backgroundColor: value}} {...tapOrClick(this.onSelect.bind(this))}>
          <div className={'selectedColor '+this.initState(key)}></div>
        </li>
      );
    });
    return colorBoard;
  }

  render() {
    return (
      <ul className='color-list'>
        {this.colorList()}
      </ul>
    );
  }
}

class DialogColorList extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      selected: this.props.color
    };

    //   黑0       红1          橙2        黄3       绿4         青5         蓝6         紫7        白8
    this.COLOR_LIST = ['#9caecd', '#ef1625', '#ff7e1c', '#fffe3e', '#00ff3e', '#00b9fc', '#1c62f9', '#ff00f7', '#FFFFFF'];
    this.COLOR_BORDER_LIST = ['#e1ecfe', '#ff5a62', '#ffb773', '#ffffc2', '#c6ffc7', '#89e0fd', '#719efb', '#ff5af8', '#d6d6d6'];
  }

  /*set selected color*/
  selected(e) {
    let num = Array.prototype.indexOf.call(e.currentTarget.parentNode.childNodes, e.currentTarget);
    this.state = {
      selected: num
    };
    this.props.onSelect({
      id: num   // colorBlock seq
    });
  }

  /*render light color*/
  color() {
    let self = this;
    //let current_color = this.props.color; //current selected color
    let colorBlock = self.COLOR_LIST.map(function (value, index) {
      //black colo set right most, others left to right, if selected, classList add selected
      return (
        <li
          className={'colorBlock'+(index==0?' right icon-eraser': '') +
          ( index==self.state.selected?' icon-selected': '')}
          key={value} data-color={index} {...tapOrClick(self.selected.bind(self))}
          style={{backgroundColor:value, border: (index==self.state.selected?'3px solid '+self.COLOR_BORDER_LIST[index]: '')}}>
        </li>
      );
    });
    return colorBlock;
  }

  render() {
    return (
      <div className='dialog-color-list'>
        <ul>{this.color()}</ul>
      </div>
    );
  }

  componentDidMount() {
    let self = this;
    self._registerToken = AppDispatcher.register((action) => {
      if (action.actionType == AppConstants.SET_LED_STRIP_COLOR) {
        self.setState({
          selected: action.colorIndex
        });
      } else if (action.actionType == AppConstants.LED_STRIP_ACTION) {
        if(action.action == 'add') {
          self.setState({
            selected: 1
          });
        } else if (action.action == 'delete') {
          self.setState({
            selected: action.index
          });
        } else if (action.action == 'undo' || action.action == 'redo') {
          self.setState({
            selected: action.index
          });
        }
      }
    });
  }

  componentWillUnmount() {
    AppDispatcher.unregister(this._registerToken);
  }
}

export { ColorPanel, DialogColorList };