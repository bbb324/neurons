import React, { PureComponent } from 'react';
import Modal from 'react-modal';
import languages from '../../languages';
import tapOrClick from '../../utils/tapOrClick';
import commonStore from '../../stores/commonStore';
import UIActions from '../../actions/UIActions';

require('./SmartServoDialog.less');


class SmartServoDialog extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {
      modalIsOpen: false,
      servoNo: '',
      servoId: '',
      servoLength: ''
    };
    
    this.openDialog = this.openDialog.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.getServoList = this.getServoList.bind(this);
    this.showImageSection = this.showImageSection.bind(this);
    this.styleCallback = this.styleCallback.bind(this);
    this.toggleServo = this.toggleServo.bind(this);
    this.selectServo = this.selectServo.bind(this);
  }

  openDialog() {
    this.setState({
      modalIsOpen: true,
      servoNo: commonStore.servoNo,
      servoId: commonStore.servoId,
      servoLength: commonStore.servoLength
    });
    setTimeout(() => {
      this.styleCallback();
    }, 0);
  }

  closeDialog() {
    this.setState({
      modalIsOpen: false,
    });
  }

  getServoList() {
    let listArr = [];
    let servoLength = this.state.servoLength;
    let servoNo = Number(this.state.servoNo);
    for(let i = 0; i < servoLength; i++) {
      if(i + 1 === servoNo) {
        listArr.push(<li key={i+1} className="selected"><img className="servo" data-no={i+1} src="./img/icon-servo-selected.png" alt=""/><span className="no">No.{i+1}</span></li>);
      }else {
        listArr.push(<li key={i+1}><img className="servo" data-no={i+1} src="./img/icon-servo-unselect.png" alt=""/><span className="no">No.{i+1}</span></li>);
      }
    }
    return listArr;
  }

  showImageSection() {
    let len = this.state.servoLength;
    let html = '';
    if(len === 0) {
      html = (
        <div className="image-section">
          <div className="text-tips">{languages.getTranslation('pls-access-smart-servo')}</div>
          <div className="servo-list-div" ref="servoListDiv">
            <ul className="servo-list" ref="servoList">
              <li><img src="./img/icon-servo-dialog.png" alt=""/></li>
            </ul>
          </div>
        </div>
      );
    }else {
      html = (
        <div className="image-section">
          <div className="text-tips">{languages.getTranslation('select-smart-servo-control')}</div>
          <div className="servo-list-div" ref="servoListDiv">
            <ul className="servo-list" ref="servoList" style={{
              background: 'url("img/icon-servo-line.png") center center repeat-x',
            }} {...tapOrClick(this.toggleServo)}>
              <li><img src="./img/icon-servo-dialog.png" alt=""/></li>
              {this.getServoList()}
            </ul>
          </div>
        </div>
      );
    }

    return html;
  }

  styleCallback() {
    let listDiv = this.refs.servoListDiv;
    let listDivWidth = this.refs.servoListDiv && Number(window.getComputedStyle(this.refs.servoListDiv).width.slice(0,-2));
    let listWidth = this.refs.servoList && Number(window.getComputedStyle(this.refs.servoList).width.slice(0,-2));
    if(listDivWidth > listWidth) {
      listDiv.style.justifyContent = 'center';
    }else {
      listDiv.style.justifyContent = 'flex-start';
    }
  }

  toggleServo(e) {
    let target = e.target;
    if(target.classList.contains('servo') || target.classList.contains('no')) {
      let imgTarget = '';
      if(target.classList.contains('servo')) {
        imgTarget = target;
      }else {
        imgTarget = target.previousSibling;
      }
      if(imgTarget.getAttribute('data-no') === this.state.servoNo || imgTarget.getAttribute('data-no') === undefined) {
        return;
      }else {
        this.setState({
          servoNo: Number(imgTarget.getAttribute('data-no'))
        });
      }
    }
  }

  selectServo() {
    if(this.state.servoLength !== 0 && Number(this.state.servoNo) !== 0) {
      this.setState({
        modalIsOpen: false,
      });
      UIActions.syncSmartServoNoToConfigurator(this.state.servoId, this.state.servoNo);
    }
  }

  render() {
    return (<Modal
      contentLabel="smart-servo-dialog"
      isOpen={this.state.modalIsOpen}
      className="smart-servo-dialog dialog"
      shouldCloseOnOverlayClick={true}
      overlayClassName="dialog-overlay">
      <div className="smart-servo-con">
        {this.showImageSection()}
        <div className="button-section">
          <span className={(this.state.servoLength !== 0  && Number(this.state.servoNo) !== 0 ) ? 'select' : 'select select-disable'} {...tapOrClick(this.selectServo)}>{languages.getTranslation('select-btn')}</span>
        </div>
        <img className="close-button" src="img/icon-closeBtn.png" alt="" {...tapOrClick(this.closeDialog)}/>
      </div>
    </Modal>);
  }

  componentDidMount() {
    commonStore.on('openSmartServoDialog', this.openDialog);
  }

  componentWillUnmount() {
    commonStore.off('openSmartServoDialog', this.openDialog);

  }
}

export {SmartServoDialog};
