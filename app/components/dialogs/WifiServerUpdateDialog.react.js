/**
 * Created by junxie on 17/4/26.
 */
import React, { Component } from 'react';
import Modal from 'react-modal';
import languages from '../../languages';
import tapOrClick from '../../utils/tapOrClick';
import wifiServerStore from '../../stores/wifiServerStore.js';
import wifiStore from '../../stores/wifiStore.js';
import UIActions from '../../actions/UIActions';
require('./WifiServerUpdateDialog.less');


class WifiServerUpdateDialog extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      modalIsOpen: false,
      title1: languages.getTranslation('wifiUpdate-title-1'),
      title2: languages.getTranslation('wifiUpdate-title-2'),
      showButton: true,
      uploadStatus: 'static',
      buttonText: languages.getTranslation('wifiUpdate-status'),
      hintImage: '',
      showCloseDialogButton: true,
      showLoadingStatus: false,
      reRender: false
    };
    this.updateButtonStatus = 'static';
  }

  updateAction() {
    let self = this;
    if(self.updateButtonStatus == 'static') {
      self.setState({
        title1: languages.getTranslation('wifiUpdate-updating'),
        title2: languages.getTranslation('wifiUpdate-warning'),
        showButton: false,
        showCloseDialogButton: false,
        uploadStatus: 'uploading'
      });
      this.refs.loadingBar.style.background = '';
      wifiStore.isUpdating(true);
      wifiServerStore.doUpdate();
    } else if(this.updateButtonStatus == 'finished') {
      wifiStore.isUpdating(false);
      self.updateButtonStatus = 'static';
      self.closeDialog();
    }
  }

  setUpdateImg() {
    if(this.state.uploadStatus == 'static' || this.state.uploadStatus == 'uploading') {
      return '';
    }
    else {
      return (
        <img className={'icon-server-update-hint '+((this.state.uploadStatus == 'static' || this.state.uploadStatus == 'loading')? 'hide':'')} src={this.state.hintImage} alt=''/>
      );
    }
  }

  render() {
    return (<Modal
      contentLabel="WifiServer-dialog"
      isOpen={this.state.modalIsOpen}
      className="server-update-dialog dialog"
      shouldCloseOnOverlayClick={true}
      overlayClassName="dialog-overlay">
      <div className="server-update-div">
        <div className='image-illustration'>
          <img className='icon-server-update' src='img/wifi-server-update.png'/>
          {this.setUpdateImg()}
          <div className="loading" style={{width: '0%'}} ref='loadingBar'></div>
        </div>
        <div className={'text-illustration '+(this.state.showLoadingStatus==false? '' :'hide')}>
          <span className='title-h1'>{this.state.title1}</span>
          <span className={'title-h2 '+(this.state.uploadStatus=='uploading'?'alert': '')}>{this.state.title2}</span>
          <span className={'button '+(this.state.showButton == true? '': 'hide')} data-status={this.updateButtonStatus} ref='updateButton' {...tapOrClick(this.updateAction.bind(this))}>{this.state.buttonText}</span>
        </div>
        <div className={'show-loading-div '+(this.state.showLoadingStatus==true? '': 'hide')}>
          <span className='title-h1'>{this.state.title1}</span>
          <div>
            <span className={'title-h2 loading-t2'}>{this.state.title2}</span>
            <div className="loading"><span></span><span></span><span></span></div>
          </div>
        </div>
        <img className={'wifiServer-close '+(this.state.showCloseDialogButton==true? '': 'hide')} {...tapOrClick(this.closeDialog.bind(this))} src='img/icon-close-white.png'/>
      </div>
    </Modal>);
  }

  openDialog() {
    this.setState({
      modalIsOpen: true
    });
    wifiServerStore.clearForceToStopUpdate();
  }

  closeDialog() {
    wifiStore.stopSearchWifiModule();
    this.setState({
      modalIsOpen: false,
      showButton: true,
      title1: languages.getTranslation('wifiUpdate-title-1'),
      title2: languages.getTranslation('wifiUpdate-title-2'),
      uploadStatus: 'static',
      buttonText: languages.getTranslation('wifiUpdate-status'),
      hintImage: '',
      showCloseDialogButton: true,
      showLoadingStatus: false,
      reRender: this.state.reRender == false? true: false
    });
    if(wifiServerStore.getUpdateStatus() == 'success') {
      UIActions.updateWifiSuccess();
      wifiStore.isUpdating(false);
    }
  }
  UpdateLoadingBar(percentage) {
    if(percentage<100) {
      this.refs.loadingBar.style.width = percentage+'%';
    } else {
      this.refs.loadingBar.style.width = '100%';
    }
  }

  UploadFinished() {
    this.setState({
      showLoadingStatus: true,
      title1: languages.getTranslation('wifiUpdate-restart-title-1'),
      title2: languages.getTranslation('wifiUpdate-restart-title-2'),
    });
    wifiServerStore.reconnectWifi();
  }

  UpdateStatus() {
    if(wifiServerStore.getUpdateStatus() == 'success') {
      if(wifiStore.getConnectChosenWifiStatus() == true && wifiServerStore.getWifiAddr().length!=0) {
        this.setState({
          title1: languages.getTranslation('wifiUpdate-update-finished-title1'),
          title2: languages.getTranslation('wifiUpdate-update-finished-title2'),
          uploadStatus: 'finished',
          showButton: true,
          buttonText: languages.getTranslation('wifiUpdate-update-finished-done'),
          hintImage: 'img/update-server-finished.png',
          showCloseDialogButton: true,
          showLoadingStatus: false
        });
        this.updateButtonStatus = 'finished';
        wifiServerStore.setUpdateStatus();
        UIActions.updateWifiSuccess();
        wifiStore.isUpdating(false);
      }
    } else {
      wifiStore.isUpdating(false);
      this.UpdateError();
    }
  }

  UpdateError() {
    this.setState({
      modalIsOpen: false,
      title1: languages.getTranslation('wifiUpdate-title-1'),
      title2: languages.getTranslation('wifiUpdate-title-2'),
      showButton: true,
      uploadStatus: 'static',
      buttonText: languages.getTranslation('wifiUpdate-status'),
      hintImage: '',
      showCloseDialogButton: true,
      showLoadingStatus: false,
    });
    this.updateButtonStatus = 'static';
    if(this.refs.loadingBar) {
      this.refs.loadingBar.style.width = '0%';
    }
  }

  componentDidMount() {
    this.openDialogFunc = this.openDialog.bind(this);
    this.UpdateLoadingBarFunc = this.UpdateLoadingBar.bind(this);
    this.UploadFinishedFunc = this.UploadFinished.bind(this);
    this.UpdateErrorFunc = this.UpdateError.bind(this);
    this.UpdateStatusFunc = this.UpdateStatus.bind(this);
    wifiServerStore.on('openUpdateDialog', this.openDialogFunc);
    wifiServerStore.on('UpdateProgressBar', this.UpdateLoadingBarFunc);
    wifiServerStore.on('UploadFinished', this.UploadFinishedFunc);
    wifiServerStore.on('UpdateError', this.UpdateErrorFunc);
    wifiStore.on('wifiConnected', this.UpdateStatusFunc);
  }

  componentWillUnmount() {
    if(this.state.uploadStatus != 'finished' || this.state.uploadStatus != 'static') {
      wifiStore.stopSearchWifiModule();
      wifiServerStore.forcetoStopUpdate();
    }
    wifiServerStore.off('openUpdateDialog', this.openDialogFunc);
    wifiServerStore.off('UpdateProgressBar', this.UpdateLoadingBarFunc);
    wifiServerStore.off('UploadFinished', this.UploadFinishedFunc);
    wifiServerStore.off('UpdateError', this.UpdateErrorFunc);
    wifiStore.off('wifiConnected', this.UpdateStatusFunc);
  }
}

export {WifiServerUpdateDialog};