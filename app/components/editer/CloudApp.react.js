import React, { Component } from 'react';

import tapOrClick from 'react-tap-or-click';
import CopyToClipboard from 'react-copy-to-clipboard';
import { CloudSlider } from '../cloudComponent/CloudSlider.react';
import { CloudButton } from '../cloudComponent/CloudButton.react';
import { CloudToggle } from '../cloudComponent/CloudToggle.react';
import { CloudLabel } from '../cloudComponent/CloudLabel.react';
import { CloudPhotoFrameViewer } from '../cloudComponent/CloudPhotoFrameViewer.react';
import { CloudText } from '../cloudComponent/CloudText.react';
import { CloudNumber } from '../cloudComponent/CloudNumber.react';
import { CloudIndicator } from '../cloudComponent/CloudIndicator.react';
import { CloudLineGraph } from '../cloudComponent/CloudLineGraph.react';
import nodeStore from '../../stores/nodeStore';
import ProjectStore from '../../stores/projectStore';
import cloudAppStore from '../../stores/cloudAppStore';
import UIActions from '../../actions/UIActions';
import languages from '../../languages';

const iot_URL = 'http://iot.makeblock.com/http/cloudapp/';
const SCREEN_HEIGHT = window.innerWidth>window.innerHeight?window.innerHeight: window.innerWidth;
const PROJECT_HEADER_HEIGHT = 70;

class CloudApp extends Component{
  constructor(){
    super(...arguments);
    this.emitter = this.props.emitter;
    this.state = {
      isActive: false,
      cloudAppList: [],
      shareDialog: 'hide',
      shareStatus: 'static',
      url: '',
      qrcode: 'hide',
      shadowDisplay: 'hide',
      cloudId: '',
      copied: false
    };
  }

  cloudAppStyle(value){
    let nameValue = nodeStore.getCurrentConfig(value.id, 'name') || languages.getTranslation('untitled');
    let action;
    switch (value.type){
    case 'CONTROLBUTTON': //按钮
      return <CloudButton name={nameValue} id={value.id} mode={'edit-mode'}/>;
    case 'SLIDER': //滑块
      action = nodeStore.getCurrentConfig(value.id, 'state');
      return <CloudSlider name={nameValue} id={value.id} action={action} mode={'edit-mode'}/>;
    case 'CONTROLTOGGLE': //开关
      action = nodeStore.getCurrentConfig(value.id, 'state');
      return <CloudToggle name={nameValue} id={value.id} action={action} mode={'edit-mode'}/>;
    case 'LABEL': // 标签
      action = nodeStore.getNodeInputValue(value.id, 'text');
      return <CloudLabel name={nameValue} id={value.id} action={action} mode={'edit-mode'}/>;
    case 'PHOTO_FRAME': // 图片查看器
      action = nodeStore.getNodeInputValue(value.id, 'snapshot') || '';
      return <CloudPhotoFrameViewer id={value.id} src={action.file} mode={'edit-mode'}/>;
    case 'TEXT_INPUT': //文本输入
      action = nodeStore.getCurrentConfig(value.id, 'text');
      return <CloudText name={nameValue} id={value.id} action={action} mode={'edit-mode'}/>;
    case 'NUMBER_INPUT': //数字输入
      action = nodeStore.getCurrentConfig(value.id, 'number');
      return <CloudNumber name={nameValue} id={value.id} action={action} mode={'edit-mode'}/>;
    case 'INDICATOR': //指示灯
      action = nodeStore.getNodeInputValue(value.id, 'input');
      return <CloudIndicator name={nameValue} id={value.id} action={action} mode={'edit-mode'}/>;
    case 'LINE_GRAPH': //图表显示
      return <CloudLineGraph name={nameValue} id={value.id} mode={'edit-mode'}/>;
    default:
      console.log('nothing');
    }
  }

  cloudAppList(){
    let list = [];
    this.state.cloudAppList.map((value)=>{
      list.push(<li className="cloudApp-desc" key={value.id} data-id={value.id} data-type={value.type}>
        {this.cloudAppStyle(value)}
      </li>);
    });
    return(list);
  }

  openShareDialog() {
    if(this.state.qrcode !='hide') {
      return;
    }
    if(this.state.shareDialog == '') {
      this.setState({
        shareDialog: 'hide',
        shadowDisplay: 'hide'
      });
      return;
    }
    if(ProjectStore.getCloudSharedId() != '') {
      this.setState({
        shareDialog: '',
        shadowDisplay: '',
        shareStatus: 'success',
        url: iot_URL+'?id='+ProjectStore.getCloudSharedId(),
      });
    } else {
      this.setState({
        shareDialog: '',
        shadowDisplay: ''
      });
    }
  }

  shareDialog() {
    if(this.state.shareStatus == 'static') {
      return this.shareStatic();
    } else if(this.state.shareStatus == 'hold') {
      return this.shareHoldingDialog();
    } else if(this.state.shareStatus =='success') {
      return this.shareSuccessDialog();
    } else if(this.state.shareStatus == 'share-fail') {
      return this.shareFailDialog();
    } else if(this.state.shareStatus == 'revoke-fail') {
      return this.revokeFailDialog();
    }
  }

  closeShareDialog() {
    this.setState({
      shareDialog: 'hide',
      shadowDisplay: 'hide',
      copied: false
    });
  }

  closeShareHolding() {
    this.setState({
      shareDialog: 'hide',
      shadowDisplay: 'hide',
      copied: false,
      shareStatus: 'static',
    });
  }

  closeShareFailed() {
    this.setState({
      shareDialog: 'hide',
      shadowDisplay: 'hide',
      shareStatus: 'static',
    });
  }

  closeQRCode() {
    this.setState({
      qrcode: 'hide',
      shadowDisplay: 'hide'
    });
  }

  closeAll() {
    this.setState({
      shareDialog: 'hide',
      qrcode: 'hide',
      shadowDisplay: 'hide',
      copied: false
    });
  }

  checkQRCode() {
    let self = this;
    let qrNode = self.refs.qrDisplay;
    if(self._qrcode == null) {
      self._qrcode = new QRCode(qrNode, {
        width : 146,
        height : 146
      });
    }
    let url = self.state.url;
    self._qrcode.clear();
    self._qrcode.makeCode(url);
    self.setState({
      qrcode: '',
      shareDialog: 'hide',
    });

    if (window._runtime == 'cordova') {
      window.ga.trackEvent('cloudShare');
    }
  }

  revokeShare() {
    if(this.state.cloudId!='')
    {
      cloudAppStore.revokeCloudAppData(this.state.cloudId);
    } else {
      cloudAppStore.revokeCloudAppData(ProjectStore.getCloudSharedId());
    }
  }

  shareProject() {
    this.setState({
      shareStatus: 'hold',
      url: '',
      copied: false
    });
    UIActions.shareCloudProject();
  }

  shareStatic() {
    return (<div className={'share-dialog '+this.state.shareDialog} ref='shareDialog'>
      <div className='triangle'></div>
      <div className='share-title'>{languages.getTranslation('share')}</div>
      <div className='share-text'>{languages.getTranslation('by-link-control-project')}</div>
      <div className='share-btn' {...tapOrClick(this.shareProject.bind(this))}>{languages.getTranslation('share-project')}</div>
      <div className='share-cancel' {...tapOrClick(this.closeShareDialog.bind(this))}>{languages.getTranslation('icon-cancel')}</div>
    </div>);
  }

  shareSuccessDialog() {
    return (<div className={'share-dialog share-success '+this.state.shareDialog} ref='shareDialog'>
      <div className='triangle'></div>
      <div className='share-title'>{languages.getTranslation('sharing-success')}</div>
      <div className='share-url'>{this.state.url}</div>
      <CopyToClipboard className='share-copy-button' text={this.state.url} onCopy={() => this.setState({copied: true})}>
        <span>{languages.getTranslation('copy-link')}</span>
      </CopyToClipboard>
      <div className={'share-copy-hint '+(this.state.copied==true?'':'share-copy-hint-hide')}>copied</div>
      <div className='share-btn' {...tapOrClick(this.checkQRCode.bind(this))}>{languages.getTranslation('view-qr-code')}</div>
      <div className='share-btn' {...tapOrClick(this.revokeShare.bind(this))}>{languages.getTranslation('revoke-share')}</div>
      <div className='share-cancel' {...tapOrClick(this.closeShareDialog.bind(this))}>{languages.getTranslation('complete')}</div>
    </div>);
  }

  shareFailDialog() {
    return (<div className={'share-dialog '+this.state.shareDialog} ref='shareDialog'>
      <div className='triangle'></div>
      <div className='share-title'>{languages.getTranslation('share-failure')}</div>
      <div className='share-text'>{languages.getTranslation('pls-check-network')}</div>
      <div className='share-btn' {...tapOrClick(this.shareProject.bind(this))}>{languages.getTranslation('share-again')}</div>
      <div className='share-cancel' {...tapOrClick(this.closeShareFailed.bind(this))}>{languages.getTranslation('icon-cancel')}</div>
    </div>);
  }

  revokeFailDialog() {
    return (<div className={'share-dialog '+this.state.shareDialog} ref='shareDialog'>
      <div className='triangle'></div>
      <div className='share-title'>{languages.getTranslation('revoke-failure')}</div>
      <div className='share-text'>{languages.getTranslation('pls-check-network')}</div>
      <div className='share-btn' {...tapOrClick(this.revokeShare.bind(this))}>{languages.getTranslation('revoke-again')}</div>
      <div className='share-cancel' {...tapOrClick(this.closeShareDialog.bind(this))}>{languages.getTranslation('icon-cancel')}</div>
    </div>);
  }

  shareHoldingDialog() {
    return (<div className={'share-dialog '+this.state.shareDialog} ref='shareDialog'>
      <div className='triangle'></div>
      <div className='share-title'>{languages.getTranslation('sharing')}</div>
      <div className="loading"><span></span><span></span><span></span></div>
      <div className='share-cancel' {...tapOrClick(this.closeShareHolding.bind(this))}>{languages.getTranslation('icon-cancel')}</div>
    </div>);
  }

  getProjectlListHeight() {
    //(SCREEN_HEIGHT - PROJECT_HEADER_HEIGHT)
    if(/iPhone|Android/.test(navigator.userAgent)) {   // is phone
      return '82.9vh';
    }
    else { // is tablets
      return SCREEN_HEIGHT - PROJECT_HEADER_HEIGHT;
    }
  }

  render(){
    return (
      <div className={'cloudApp-main '+(this.state.isActive==true?'show-cloudApp-main':'')}>
        <div className="cloudApp-header">
          <div className='cloudApp-close' {...tapOrClick(this.closeCloudApp.bind(this))}><img className='icon-close' src='img/icon-backward.png' ref='iconBackWard' /></div>
          <span className='cloudApp-title'>{languages.getTranslation('cloud-app')}</span>
          <span className='cloudApp-publish' {...tapOrClick(this.openShareDialog.bind(this))}><img className='share-icon' src='img/icon-share.png'/></span>
        </div>
        {this.shareDialog()}
        <div className='cloudApp-projects' style={{height: this.getProjectlListHeight()}}>
          <ul className='cloudApp-list' ref='AppList'>
            {this.cloudAppList()}
          </ul>
        </div>
        <div className={'panel-cover' +this.state.shadowDisplay } {...tapOrClick(this.closeAll.bind(this))}></div>
        <div className={'qrcode-display ' + this.state.qrcode}>
          <span className='qrcode-title'>{languages.getTranslation('pls-scan-qr-code')}</span>
          <div className='qrcode-code-div' >
            <div className='qrcode-code' ref='qrDisplay'></div>
          </div>
          <div className='qrcode-btn-div'><div className='qrcode-btn' {...tapOrClick(this.closeQRCode.bind(this))}>{languages.getTranslation('icon-confirm-ok')}</div></div>
        </div>
      </div>
    );
  }

  openCloudApp(cloudAppList){
    this.setState({
      isActive: true,
      cloudAppList: cloudAppList
    });

  }

  closeCloudApp(){
    let self = this;
    self.setState({
      isActive: false,
      cloudAppList: [],
      shareDialog: 'hide',
      shadowDisplay: 'hide',
      qrcode: 'hide',
      copied: false
    });
    self.refs.iconBackWard.style.webkitTransform = 'translate(19px, -50%) rotate(180deg)';
    setTimeout(()=>{
      self.refs.iconBackWard.style.webkitTransform = '';
    }, 500);

  }

  fetchSucceed(result) {
    this.setState({
      shareStatus: 'success',
      url: result.url,
      cloudId: result.id
    });
  }

  fetchFailed() {
    this.setState({
      shareStatus: 'share-fail',
      url: ''
    });
  }

  revokeSuccess() {
    this.setState({
      shareStatus: 'static',
      url: '',
      cloudId: ''
    });
  }
  revokeFailed() {
    this.setState({
      shareStatus: 'revoke-fail',
    });
  }

  componentDidMount(){
    this.openCloudAppFunc = this.openCloudApp.bind(this);
    this.openCloudProject = this.emitter.addListener('openCloudApp', this.openCloudAppFunc);
    this.fetchedDataFunc = this.fetchSucceed.bind(this);
    this.fetchFailedFunc = this.fetchFailed.bind(this);
    cloudAppStore.on('fetchSuccess', this.fetchedDataFunc);
    cloudAppStore.on('fetchFail', this.fetchFailedFunc);

    this.revokeSuccessFunc = this.revokeSuccess.bind(this);
    this.revokeFailedFunc = this.revokeFailed.bind(this);
    cloudAppStore.on('revokeSuccess', this.revokeSuccessFunc);
    cloudAppStore.on('revokeFail', this.revokeFailedFunc);
  }

  componentDidUpdate() {
    if(this.state.copied == true) {
      setTimeout(()=>{
        this.setState({
          copied: false
        });
      }, 500);
    }
  }

  componentWillUnmount(){
    cloudAppStore.off('fetchSuccess', this.fetchedDataFunc);
    cloudAppStore.off('fetchFail', this.fetchFailedFunc);
    cloudAppStore.off('revokeSuccess', this.revokeSuccessFunc);
    cloudAppStore.off('revokeFail', this.revokeFailedFunc);
    this.openCloudProject.remove();
  }


}

export { CloudApp };