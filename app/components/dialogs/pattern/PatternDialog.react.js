/**
 * Created by junxie on 2016/10/10.
 */
import React, { Component } from 'react';
import AppDispatcher from '../../../dispatcher/AppDispatcher';
import AppConstants from '../../../constants/AppConstants';
import Modal from 'react-modal';
import tapOrClick from 'react-tap-or-click';
import { Pattern } from './Pattern.react';
import { SelectMode } from './SelectMode.react';
import { DialogColorList } from '../../configurator/ColorPanel.react';
import UIActions from '../../../actions/UIActions';
import languages from '../../../languages';

require('./PatternDialog.less');

class PatternDialog extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      modalIsOpen: false,
      title: '',
      selectedColor: '', //top color select index
      onConfirm: null,  //current selected color range from [0~8], 0 stands for #000000
      forwards: new Array(),
      currentSelected: '',
      mode: ''
    };
    this.mainStream = {mainSeq: [], selection: []};
    this.count = -1;
    this.redoList = {mainSeq: [], selection: []};
    this.newOption = false;
  }

  closeModal() {
    this.setState({modalIsOpen: false,});
  }

  // set ledSetting configuration
  setConf() {
    let obj = {};
    obj.mode = document.querySelector('.icon-ok-2').dataset.value;
    obj.colors = this.state.forwards;
    return obj;
  }

  onClose() {
    this.closeModal();
  }

  onSelect(color) {
    //get selected color
    let self = this;
    self.count++;
    self.newOption = true;

    if (self.mainStream.mainSeq.length >= 5) {
      self.updateMainList();
      let newArr = self.state.forwards.concat();
      newArr[self.state.currentSelected] = color.id;
      self.setState({
        forwards: newArr,
      });
    } else {
      self.mainStream.mainSeq[self.count] = self.state.forwards;
      self.mainStream.selection[self.count] = self.state.currentSelected;
      let newArr = self.state.forwards.concat();
      newArr[self.state.currentSelected] = color.id;
      self.setState({
        forwards: newArr,
      });
    }
  }

  //add button option
  addLedBtn() {
    let self = this;
    self.newOption = true;
    self.count++;
    if (self.mainStream.mainSeq.length == 5) {
      self.updateMainList();
      self.latestPattern('add');
    }
    else {
      self.mainStream.mainSeq[self.count] = self.state.forwards;
      self.mainStream.selection[self.count] = self.state.currentSelected;
      self.latestPattern('add');
    }
  }

  //remove button option
  delLedBtn() {
    let self = this;
    self.newOption = true;
    self.count++;
    if (self.mainStream.mainSeq.length == 5) {
      self.updateMainList();
      self.latestPattern('del');
    }
    else {
      self.mainStream.mainSeq[self.count] = self.state.forwards;
      self.mainStream.selection[self.count] = self.state.currentSelected;
      self.latestPattern('del');
    }
  }

  updateMainList() {
    let self = this;
    self.mainStream.mainSeq.shift();
    self.mainStream.selection.shift();
    self.mainStream.selection.push(self.state.currentSelected);
    self.mainStream.mainSeq.push(self.state.forwards);
  }

  undo() {
    let self = this;
    self.newOption = false;
    if (self.mainStream.mainSeq.length == 0) {
      return;
    }
    let newArr = self.mainStream.mainSeq.pop();
    let count = self.mainStream.selection.pop();
    if (newArr == undefined) {
      return;
    }
    self.redoList.mainSeq.push(self.state.forwards);
    self.redoList.selection.push(self.state.currentSelected);
    self.setState({
      forwards: newArr,
      currentSelected: count,
      selectedColor: newArr[count]
    });
    UIActions.ledStripAction('undo', newArr[count]);
  }

  redo() {
    let self = this;
    let newArr = self.redoList.mainSeq.pop();
    let count = self.redoList.selection.pop();
    if (newArr == undefined || self.newOption == true) {
      return;
    }
    if (self.mainStream.mainSeq.length == 5) {
      return;
    }
    self.mainStream.mainSeq.push(self.state.forwards);
    self.mainStream.selection.push(self.state.currentSelected);
    self.setState({
      forwards: newArr,
      currentSelected: count,
    });
    UIActions.ledStripAction('redo', newArr[count]);
  }

  //to update LED list view
  latestPattern(value) {
    let self = this;
    if (value != undefined) {
      let count = self.addLedFunc().count;
      let addArr = self.addLedFunc().addArr;
      if (value == 'add') {
        self.setState({
          forwards: addArr,
          currentSelected: count,
        });
        UIActions.ledStripAction('add');
      } else if (value == 'del') {
        let count = self.delLedFunc().count;
        let delArr = self.delLedFunc().delArr;
        self.setState({
          forwards: delArr,
          currentSelected: count
        });
        UIActions.ledStripAction('delete', delArr[count]);
      }
    }
  }

  //return new LED list after add
  addLedFunc() {
    let self = this;
    let newArr = self.state.forwards.concat();
    newArr.push(1);
    let addOption = {addArr: newArr, count: newArr.length - 1};
    return addOption;
  }

  //return new LED list after delete
  delLedFunc() {
    let self = this;
    let newArr = self.state.forwards.concat();
    let count = self.state.currentSelected;//表示删除第几个，index
    let tmpArr = [];
    for (let i = 0; i < newArr.length; i++) {
      if (i != count) {
        tmpArr.push(newArr[i]);
      }
    }
    if (count == tmpArr.length) { // if the delete item is the last item, set next selected item as last one
      count = count - 1;
    }
    let delOption = {delArr: tmpArr, count: count};
    return delOption;
  }

  // close window and change state
  onConfirm() {
    let self = this;
    self.setState({
      mode: document.querySelector('.icon-ok-2').dataset.value
    });
    let pattern = this.setConf();
    this.state.onConfirm && this.state.onConfirm(pattern);
    this.closeModal();
  }

  onCancel() {
    this.closeModal();
  }

  renderActions() {
    return (
      <div className="pattern-dialog-actions">
        <span className={'pattern-dialog-undo '} {...tapOrClick(this.undo.bind(this))}>
          <i className="icon-undo"></i>
        </span>
        <span className={'pattern-dialog-redo '} {...tapOrClick(this.redo.bind(this))}>
          <i className="icon-redo"></i>
        </span>
        <span className={'pattern-dialog-delete '} {...tapOrClick(this.delLedBtn.bind(this))}>
          <i className="icon-delete-2"></i>
        </span>
      </div>
    );
  }

  render() {
    let self = this;
    return (
      <Modal
        isOpen={self.state.modalIsOpen}
        className={'pattern-dialog'}
        contentLabel='PatternDialogModal'
        overlayClassName='dialog-overlay'>
        <div className='dialog-container' ref='container'>
          <div className='title'>
            {self.state.title}
          </div>
          <div className={'pattern-dialog-body ' + (self.state.showExamples?'spring': '')}>
            <DialogColorList color={self.state.selectedColor} onSelect={self.onSelect.bind(self)}/>

            <div className='ledSet'>
              <Pattern pattern={self.state.forwards}
                       currentSelected={self.state.currentSelected}
                       addLedCallback={self.addLedBtn.bind(self)}/>
            </div>
            {this.renderActions()}
            <SelectMode mode={self.state.mode} />

            <div className="color-dialog-footer">
              <span
                className="color-dialog-btn color-dialog-confirm" {...tapOrClick(self.onConfirm.bind(self))}>{languages.getTranslation('dialog-action-confirm')}</span>
              <span
                className="color-dialog-btn color-dialog-cancel" {...tapOrClick(self.onCancel.bind(self))}>{languages.getTranslation('dialog-action-cancel')}</span>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  componentDidMount() {
    let self = this;
    self._registerToken = AppDispatcher.register((action) => {
      if (action.actionType == AppConstants.PATTERN_SETTING_DIALOG) {
        self.setState({
          modalIsOpen: true,
          title: action.titleName,
          onConfirm: action.onConfirm,
          forwards: action.defaultConf.pattern.colors,
          currentSelected: action.defaultConf.pattern.colors.length - 1,
          selectedColor: action.defaultConf.pattern.colors[action.defaultConf.pattern.colors.length - 1],
          mode: action.defaultConf.pattern.mode,
          id: action.id
        });
        self.count = -1;
        self.mainStream.mainSeq = [];
      } else if (action.actionType == AppConstants.SET_LED_STRIP_COLOR) {
        self.setState({
          currentSelected: action.ledIndex
        });
      }
    });
  }

  componentWillUnmount() {
    let self = this;
    AppDispatcher.unregister(self._registerToken);
  }
}

export { PatternDialog };
