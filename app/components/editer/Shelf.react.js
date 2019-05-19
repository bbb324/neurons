import React, { Component } from 'react';
import nodeFactory from '../nodes/nodeFactory.js';
import { TouchHandler } from './TouchHandler';
import tapOrClick from 'react-tap-or-click';
import UIActions from '../../actions/UIActions';
import nodeStore from '../../stores/nodeStore';
import linkStore from '../../stores/LinkStore';
import wifiStore from '../../stores/wifiStore';
import wifiServerStore from '../../stores/wifiServerStore';
import AppDispatcher from '../../dispatcher/AppDispatcher';
import AppConstants from '../../constants/AppConstants';
import languages from '../../languages';
require('./editer.less');

class NodeTouchHandler extends TouchHandler {
  constructor() {
    super(...arguments);
    this.canMove = false;
    this.draggingObject = null;
    this._xValue = 0;
    this._lastX = 0;
    this._lastY = 0;
    this._angle = 45;
    this._tan30 = Math.tan(30 * Math.PI / 180);
    this.YDELTALIMIT = 10;
    this.XDELTALIMIT = Math.round(this.YDELTALIMIT / this._tan30);
    this._positiveStep = 20;
    this._negativeStep = -20;
    this._quickPositiveStep = 45;
    this._quickNegativeStep = -45;
    this._shelfWidth = 0;
    this._shelfHeight = 0;
    this._bluetoothWidth = 0;
    this._marginWidth = 32;
    this._halfMarginWidth = 16;
    this._currentWidth = 0;
    this._canMoveWidth = 0;
    this._isDraggingNode = false;
    this._isMovingNode = false;
    this._isTouchNode = false;
    this._tempNode = null;
    this._moveCount = 0;
    this._noNodes = false;
    this._minMoveLeft = 0;
    this._maxMoveRight = 0;
    this._canMoveEvent = false;
    this._leftIntervalId = 0;
    this._rightIntervalId = 0;
    this.initPos = {x: '', y: ''};
    this._maxDiffTime = 50;
    this._lastMoveNodeTime = 0;
    this._currentMoveNodeTime = 0;
  }

  resetState() {
    this.canMove = false;
    this._isDraggingNode = false;
    this._isMovingNode = false;
    this._isTouchNode = false;
  }

  onStart(e) {
    if (e.target.closest('.shelf-nodes') && !(e.target.closest('.shelf-node') && e.target.closest('.shelf-node').querySelector('.update-mask'))) {
      if (e.touches.length == 1) {
        this.getShelfBorderLimit();
        this.getCurrentWidth(e);
        if (this._noNodes) {
          return;
        }
        this._moveCount = 0;
        this._tempNode = e.target.closest('.node-preview');
        if (this._tempNode) {
          this._isTouchNode = true;
          this.baseTop = this._getOffsetRect(this._tempNode).top - parseInt(window.getComputedStyle(this._tempNode).marginTop);
          this.baseLeft = this._getOffsetRect(this._tempNode).left - parseInt(window.getComputedStyle(this._tempNode).marginLeft);
        } else {
          this.canMove = false;
          this._isTouchNode = false;
          this.draggingObject = e.target.closest('.shelf-nodes');
        }
        this.touchX = this._touches(e)[0].pageX;
        this.touchY = this._touches(e)[0].pageY;
        this.initPos.x = this.touchX;
        this.initPos.y = this.touchY;
        this._lastX = this.touchX;
        this._lastY = this.touchY;
        this._canMoveEvent = false;
      }
    }
  }

  onMove(e) {
    if (e.target.closest('.shelf-nodes')) {
      this._currentMoveNodeTime = new Date().getTime();
      let diffTime = this._currentMoveNodeTime - this._lastMoveNodeTime;
      if(diffTime <= this._maxDiffTime) {
        return;
      }
      this._lastMoveNodeTime = this._currentMoveNodeTime;
      if (this._noNodes) {
        return;
      }
      this._moveCount += 1;
      this.scrollNodes(e);
      if (this._isTouchNode && this.canMove && this.draggingObject && !(e.target.closest('.shelf-node').querySelector('.update-mask'))) {
        let deltaX = this._touches(e)[0].pageX - this.touchX;
        let deltaY = this._touches(e)[0].pageY - this.touchY;
        this.draggingObject.style.top = this.baseTop + deltaY + 'px';
        this.draggingObject.style.left = this.baseLeft + deltaX + 'px';
        if (!this._canMoveEvent) {
          this._canMoveEvent = true;
          this.container.emitter.emit('beginMovingNodeToCanvas');
        }
      }
    }
  }

  onEnd(e) {
    if(this._noNodes) {
      return;
    }
    this.scrollQuickly(e);
    if (this.canMove && !(e.target.closest('.shelf-node').querySelector('.update-mask'))) {
      let shelfNodes = e.target.closest('.shelf-nodes');
      if (this.draggingObject) {
        this.draggingObject.remove();
      }
      var elem = document.elementFromPoint(this._touches(e)[0].pageX, this._touches(e)[0].pageY);
      if (!elem.closest('.editer-shelf')) {
        //fix nodes is too long
        if(this._xValue < 0) {
          this._xValue += e.target.offsetWidth;
        }
        if(this._xValue > 0) {
          this._xValue = 0;
        }
        shelfNodes.style.transform = 'translateX(' + this._xValue + 'px)';
        let nodeInfo = {
          left: parseInt(this.draggingObject.style.left),
          top: parseInt(this.draggingObject.style.top),
          ins: [],
          outs: [],
          type: this.draggingObject.dataset.type,
          id: this.draggingObject.id,
          category: this.draggingObject.dataset.category
        };
        this.container.emitter.emit('addNode', nodeInfo);
      }
    }
    this.resetState();
  }

  onCancel() {
    this.draggingObject.remove();
  }

  getShelfBorderLimit() {
    if(document.querySelector('.connect-icon')) {
      let BluetoothRect = document.querySelector('.connect-icon').getBoundingClientRect();
      let ShelfEditerRect = document.querySelector('.editer-shelf').getBoundingClientRect();
      this._bluetoothWidth = BluetoothRect.width;
      this._shelfWidth = ShelfEditerRect.width - this._bluetoothWidth;
      this._shelfHeight = ShelfEditerRect.height;
      this._minMoveLeft = ShelfEditerRect.left + this._bluetoothWidth;
      this._maxMoveRight = ShelfEditerRect.right;
    }
  }

  getCurrentWidth(e) {
    this._currentWidth = 0;
    let nodes = document.querySelector('.shelf-nodes');
    if(nodes == null || nodes.childNodes.length == null) {
      console.log('shelf-nodes is null');
      this._noNodes = true;
      return;
    }
    this._noNodes = false;
    let editerShelf = e.target.closest('.editer-shelf');
    if(editerShelf == null) {
      return;
    }

    for(let i = 0; i < nodes.childNodes.length; ++i) {
      this._currentWidth += nodes.childNodes[i].clientWidth;
    }
    this._currentWidth += this._marginWidth * nodes.childNodes.length;
    if(this._currentWidth > this._shelfWidth) {
      this._canMoveWidth = this._currentWidth - this._shelfWidth + this._halfMarginWidth;
    } else {
      this._canMoveWidth = 0;
      this._xValue = 0;
      document.querySelector('.shelf-nodes').style.transform = 'translateX(0px)';
    }
  }

  scrollQuickly(e) {
    if(!this.canMove) {
      if(this._moveCount < 10) {
        let i = 0;
        let shelfNodes = document.querySelector('.shelf-nodes');
        if(shelfNodes == null) {
          return;
        }
        let deltaX = this._touches(e)[0].pageX - this.touchX;
        if(Math.abs(deltaX) > 100) {
          if(deltaX < 0) {
            let maxCount = Math.floor(this._canMoveWidth / this._quickPositiveStep);
            clearInterval(this._leftIntervalId);
            clearInterval(this._rightIntervalId);
            this._leftIntervalId = setInterval(()=>{
              i += 1;
              if(Math.abs(this._xValue) + this._quickPositiveStep < this._canMoveWidth) {
                this._xValue += this._quickNegativeStep;
                shelfNodes.style.transform = 'translateX(' + this._xValue + 'px)';
              } else {
                this._xValue = 0 - this._canMoveWidth;
                shelfNodes.style.transform = 'translateX(' + this._xValue + 'px)';
                clearInterval(this._leftIntervalId);
              }
              if(i >= maxCount) {
                clearInterval(this._leftIntervalId);
              }
            }, 10);
          } else {
            if(this._xValue < 0) {
              let maxCount = Math.round(Math.abs(this._xValue) / this._quickPositiveStep);
              clearInterval(this._leftIntervalId);
              clearInterval(this._rightIntervalId);
              this._rightIntervalId = setInterval(()=>{
                i += 1;
                if((this._xValue + this._quickPositiveStep) < 0) {
                  this._xValue += this._quickPositiveStep;
                  shelfNodes.style.transform = 'translateX(' + this._xValue + 'px)';
                } else {
                  this._xValue = 0;
                  shelfNodes.style.transform = 'translateX(' + this._xValue + 'px)';
                  clearInterval(this._rightIntervalId);
                }
                if(i >= maxCount) {
                  clearInterval(this._rightIntervalId);
                }
              }, 10);
            }
          }
        }
      }
    }
  }

  scollLeftRight(xDelta) {
    if(xDelta < 0) {
      if(Math.abs(this._xValue) < this._canMoveWidth) {
        this._xValue += this._negativeStep;
        if(Math.abs(this._xValue) > this._canMoveWidth) {
          this._xValue = 0 - this._canMoveWidth;
        }
        document.querySelector('.shelf-nodes').style.transform = 'translateX(' + this._xValue + 'px)';
      }
    } else {
      if(this._xValue < 0) {
        this._xValue += this._positiveStep;
        if(this._xValue > 0) {
          this._xValue = 0;
        }
        document.querySelector('.shelf-nodes').style.transform = 'translateX(' + this._xValue + 'px)';
      }
    }
  }

  scrollEmptyArea(e) {
    if(this._isTouchNode == true || this._canMoveWidth == 0) {
      return;
    }
    let xDelta = this._touches(e)[0].pageX - this._lastX;
    if(this._touches(e)[0].pageY > this._shelfHeight) {
      return;
    } 
    
    this.scollLeftRight(xDelta);
    this._lastX = this._touches(e)[0].pageX;
  }

  scrollNodeArea(e) {
    if(this._isTouchNode == false) {
      return;
    }
    let xDelta = this._touches(e)[0].pageX - this._lastX;
    let yDelta = this._touches(e)[0].pageY - this.touchY;
    
    if((this.baseTop + yDelta) > this._shelfHeight) {
      return;
    } 
    
    if(!this._isDraggingNode && this._isMovingNode) {
      this._lastX = this._touches(e)[0].pageX;
      if(this._canMoveWidth == 0) {
        return;
      }
      this.scollLeftRight(xDelta);
      return;
    }

    if(!this._isDraggingNode && Math.abs(yDelta) <= this.YDELTALIMIT) {
      if(Math.abs(xDelta) > this.XDELTALIMIT) {
        if(this._canMoveWidth == 0) {
          return;
        }
        this._isDraggingNode = false;
        this._isMovingNode = true;
        this.scollLeftRight(xDelta);
        this._lastX = this._touches(e)[0].pageX;
      }
    } else {
      if(Math.abs(xDelta) > this.XDELTALIMIT || this._isMovingNode) {
        return;
      } 
      this._isDraggingNode = true;
      this._isMovingNode = false;
      if (this._tempNode && !this.canMove) {
        this.canMove = true;
        this.draggingObject = this._tempNode.cloneNode(true);
        this.draggingObject.style.position = 'absolute';
        this.draggingObject.style.top = this.baseTop + 'px';
        this.draggingObject.style.left = this.baseLeft + 'px';
        document.querySelector('.editer-main').appendChild(this.draggingObject);
      } 
    }
  }

  scrollNodes(e) {
    if(this._minMoveLeft != 0 && this._maxMoveRight != 0) {
      if(this._touches(e)[0].pageX <= this._minMoveLeft || this._touches(e)[0].pageX >= this._maxMoveRight) {
        return;
      }
    }
    this.scrollEmptyArea(e);
    this.scrollNodeArea(e);
  }

}


class Shelf extends Component {
  constructor() {
    super(...arguments);
    this.emitter = this.props.emitter;
    this.touchHandler = new NodeTouchHandler(this);
    this._showDelete = false;
    this.state = {
      nodes: nodeStore.getUnusedElectronicNodes(),
      connectedType: false,
      reRender: false,
      showUpdateWarning: this.getUpdateTips()
    };
    this.inspector_PC = false;
    this._showConnectedWifiIcon = 'showWifiIcon';   //showWifiIcon showWifiCloseIcon showWifiEqualIcon
    this._showConnectedWifiRunningDiv = 'showWifiRunning'; //showWifiRunning showWifiCancelRunning
    this._showConnectedWifiStoppedDiv = ''; //showUploadDisconn showCover
    this._wifiRunningStatus = 'stopped'; //running stopped
    this._uploadCodeSuc = false; //true false
    this._targetIp = ''; //pass connected wifi ip to wifi update panel
    this.renderNodes = this.renderNodes.bind(this);
  }

  getUpdateTips() {
    if(wifiStore.getConnectChosenWifiStatus() == false) {
      return false;
    } else {
      return JSON.parse(localStorage.getItem('need-update')) || false;
    }
  }

  resetState() {
    this._showDelete = false;
    this._showConnectedWifiIcon = 'showWifiIcon';
    this._showConnectedWifiRunningDiv = 'showWifiRunning'; 
    this._showConnectedWifiStoppedDiv = '';
    this._wifiRunningStatus = 'stopped';
    this._uploadCodeSuc = false;
  }

  renderNodes() {
    // debug on electron,don't show bluetooth hint
    if(window._runtime == 'electron'){
      this.inspector_PC = true;
      this.state.connectedType = 'ble';
    }
    //test
    //this.inspector_PC = false;
    // this.state.connectedType = 'wifi';
    //end test
    if (this.inspector_PC == false || this.state.connectedType == '') {
      return (
        <div className='noConnection'>
          <img className='connected icon-wifi' src='img/icon-wifi.png' {...tapOrClick(this.connectWifi.bind(this))}/>
          <img className='connected icon-ble' src='img/icon-ble.png' {...tapOrClick(this.connectBle.bind(this))}/>
          <span className='connect-txt'>{languages.getTranslation('choose-hardware-connect-type')}</span>
        </div>
      );
    }
    else if(this.inspector_PC == true || this.state.connectedType != '') {
      let nodes = this.state.nodes.map((node, i)=> {
        let Node = nodeFactory[node.type];
        if (Node) {
          return (
            <li className='shelf-node' key={node.id}>
              <Node isPreview={true} info={this.props.nodeTypes[node.type]} nodeId={node.id} key={node.id}/>
              {(node.update === true) ? <div className="update-mask" {...tapOrClick(this.openUpdateFirmware.bind(this, node.id, node.type))}><span>{languages.getTranslation('click-update')}</span></div> : ''}
            </li>
          );
        } else {
          console.log('Component not defined: ', node.type);
          return (
            <li key={i}>
              <div>{node.type}</div>
            </li>
          );
        }
      });

      //fix transformStyle no reset
      setTimeout(()=>{
        if((this.state.nodes instanceof Array) && this.state.nodes.length === 0) {
          document.querySelector('.shelf-nodes').style.transform = 'translateX(0)';
        }
      }, 0);
      return (
        <div className='show-hardware'>
          {this.getConnectedType()}
          <ul className='shelf-nodes'>{nodes}</ul>
          {this.getConnectedOptions()}
        </div>
      );
      // return this.getConnectedType();
    }
  }

  openUpdateFirmware(id, type) {
    UIActions.showUpdateFirmwareDialog(id, type, this.state.connectedType);
  }

  getConnectedType() {
    let self = this;
    let tips = '';
    if(self.state.connectedType == 'ble') {
      tips = (
        <div className='connect-icon'>
          <img {...tapOrClick(this.disconnectBle.bind(this))} className='connected-hardware' src='img/icon-ble.png'/>
        </div>
      );
    } else if(self.state.connectedType == 'wifi') {
      if(self._showConnectedWifiIcon == 'showWifiIcon') {
        tips = (
          <div className='connect-icon' {...tapOrClick(this.showWifiDialog.bind(this))}>
            <img className='connected-hardware' src='img/icon-wifi.png'/>
          </div>
        );
      } else if(self._showConnectedWifiIcon == 'showWifiCloseIcon') {
        tips = (
          <div className='connect-icon' {...tapOrClick(this.closeWifiDialog.bind(this))}>
            <img className='disconnected-hardware' src='img/icon-disconn.png'/>
          </div>
        );
      } else if(self._showConnectedWifiIcon == 'showWifiEqualIcon') {
        tips = (
          <div className='connect-icon' {...tapOrClick(this.equalWifiUpload.bind(this))}>
            <img className='upload-hardware' src='img/wifi-upload.png'/>
          </div>
        );
      }
    }
    if (window._runtime == 'cordova') {
      window.ga.trackEvent('connect', self.state.connectedType);
    }
    return tips;
  }

  getConnectedOptions() {
    let self = this;
    let tips = '';
    if(self.state.connectedType == 'wifi') {
      if(self._wifiRunningStatus == 'stopped') {
        if(self._showConnectedWifiStoppedDiv == 'showUploadDisconn') {
          tips = (
            <div className='wifi-connected-div'>
              <div className='upload' {...tapOrClick(this.confirmUploadCode.bind(this))}>
                {languages.getTranslation('upload-text')}
              </div>
              <div className='disconnect' {...tapOrClick(this.disconnectWifi.bind(this))}>
                {languages.getTranslation('disconnect-text')}
              </div>
            </div>
          );
        } else if(self._showConnectedWifiStoppedDiv == 'showCover') {
          tips = (
            <div className='wifi-connected-div'>
              <div className='override' {...tapOrClick(this.confirmUploadCode.bind(this))}>
                {languages.getTranslation('override-text')}
              </div>
              <div className='overridetips'>
                <div className='overridetips-tips'>
                  {languages.getTranslation('overridetips-tips')}
                </div>
              </div>
            </div>
          );
        } else if(self._showConnectedWifiStoppedDiv == 'showCoverResult') {
          let iRetText = '';
          if(self._uploadCodeSuc) {
            iRetText = languages.getTranslation('override-success');
          } else {
            iRetText = languages.getTranslation('override-fail');
          }
          console.log(iRetText);
          tips = (
            <div className='wifi-connected-div'>
              <div className='cover-result-text'>
                {iRetText}
              </div>
            </div> 
          );
        } else if(self._showConnectedWifiStoppedDiv == 'showCovering') {
          tips = (
            <div className='wifi-connected-div'>
              <div className='cover-result-text'>
                {languages.getTranslation('override-ing')}
              </div>
            </div> 
          );
        }
      } else if(self._wifiRunningStatus == 'running') {
        if(self._showConnectedWifiRunningDiv == 'showWifiRunning') {
          tips = (
            <div className='wifi-connected-div'>
              <div className='override' {...tapOrClick(this.updateCode.bind(this))}>
                <div className='override-text'>
                  {languages.getTranslation('override-text')}
                </div>
              </div>
              <div className='running-text'>
                {languages.getTranslation('wifi-module-is-running')}
              </div>
            </div> 
          );
        } else if(self._showConnectedWifiRunningDiv == 'showWifiCancelRunning') {
          tips = (
            <div className='wifi-connected-div'>
              <div className='upload' {...tapOrClick(this.cancelUpload.bind(this))}>
                <div className='upload-text'>
                  {languages.getTranslation('wifi-fetch-program')}
                </div>
              </div>
              <div className='disconnect' {...tapOrClick(this.disconnectWifi.bind(this))}>
                <div className='disconnect-text'>
                  {languages.getTranslation('disconnect-text')}
                </div>
              </div>
            </div>
          );
        } 
      }
    }
    return tips;
  }

  disconnectWifi() {
    console.log('disconnectWifi');
    UIActions.openDisconnDialog('wifi');
  }

  disconnectBle() {
    console.log('disconnectBle');
    UIActions.openDisconnDialog('ble');
  }

  updateCode() {
    let self = this;
    self._wifiRunningStatus = 'stopped';
    self._showConnectedWifiStoppedDiv = 'showCovering';
    self.setState({
      reRender: false
    });
    UIActions.confirmUploadCode();
  }

  confirmUploadCode() {
    console.log('confirmUploadCode');
    UIActions.confirmUploadCode();
  }

  cancelUpload() {
    console.log('cancelUpload');
    UIActions.cancelUpload();
  }

  stopWifiRunningProject() {
    console.log('stopWifiRunningProject');
    let self = this;
    self._showConnectedWifi = 'showWifiCancelRunning';
    self.setState({
      reRender: false
    });
  }

  finishWifiUpload() {
    let self = this;
    console.log('finishWifiUpload');
    self._showConnectedWifi = 'showWifiDisconn';
    self.setState({
      reRender: false
    });
  }

  connectWifi() {
    console.log('connect wifi');
    UIActions.openWifiDialog('STA');
    // UIActions.connectChosenWifi('192.168.2.100', 8081);
  }

  showWifiDialog() {
    let self = this;
    console.log('showWifiDialog');
    self._showConnectedWifiIcon = 'showWifiCloseIcon';
    self._showConnectedWifiStoppedDiv = 'showUploadDisconn';
    self._wifiRunningStatus = 'stopped';
    self.setState({
      reRender: false
    });
  }

  closeWifiDialog() {
    let self = this;
    console.log('closeWifiDialog');
    if(self._wifiRunningStatus == 'running') {
      self._showConnectedWifiIcon = 'showWifiEqualIcon';
      self._showConnectedWifiRunningDiv = 'showWifiRunning';
    } else if(self._wifiRunningStatus == 'stopped') {
      self._showConnectedWifiIcon = 'showWifiIcon';
      self._showConnectedWifiStoppedDiv = '';
      self._showConnectedWifiRunningDiv = '';
    }
    self.setState({
      reRender: false
    });
  }

  equalWifiUpload() {
    let self = this;
    self._showConnectedWifiIcon = 'showWifiCloseIcon';
    self._showConnectedWifiStoppedDiv = 'showUploadDisconn';
    self._showConnectedWifiRunningDiv = 'showWifiCancelRunning';
    self.setState({
      reRender: false
    });
  }

  connectBle() {
    UIActions.openLinkAutoConnectDialog();
  }

  onStart(e) {
    e.preventDefault();
    this.touchHandler.onStart(e);
  }

  onMove(e) {
    e.preventDefault();
    this.touchHandler.onMove(e);
  }

  onEnd(e) {
    e.preventDefault();
    this.touchHandler.onEnd(e);
  }
  onCancel(e) {
    e.preventDefault();
    this.touchHandler.onCancel(e);
  }

  render() {
    return (
      <div className='editer-shelf'
           onTouchStart={this.onStart.bind(this)}
           onTouchMove={this.onMove.bind(this)}
           onTouchEnd={this.onEnd.bind(this)}
           onTouchCancel={this.onCancel.bind(this)}
      >
        <div className='shelf-div'>
            {this.renderNodes()}
        </div>
        {this.getShelfDeleteTap()}
        {this.updateWarning()}
      </div>
    );
  }

  getShelfDeleteTap() {
    let self = this;
    let deleteTips = '';
    if(self.state.connectedType != '') {
      deleteTips = (
        <div className='shelf-div-delete' style={{display: this._showDelete ? 'block' : 'none'}}>
          <img className='icon-drag-delete' src={'img/icon-delete-red.png'}/>
        </div>
      );
    } else if(self.state.connectedType == '') {
      deleteTips = (
        <div className='shelf-div-delete' style={{display: this._showDelete ? 'block' : 'none', left: '0px', borderBottomLeftRadius: '20px'}}>
          <img className='icon-drag-delete' src={'img/icon-delete-red.png'}/>
        </div>
      );
    }
    return deleteTips;
  }

  getUnusedElectronicNodes(){
    console.log(nodeStore.getUnusedElectronicNodes());
    this.setState({
      nodes: nodeStore.getUnusedElectronicNodes(),
      reRender: true
    });
  }

  BlechangeStatus(){
    if('connected' == linkStore.getStatus()) {
      this.inspector_PC = true;
      this.setState({
        connectedType: 'ble',
        nodes: nodeStore.getUnusedElectronicNodes()
      });
    } else {
      this.setState({connectedType: ''});
    }
  }

  WifiChangeStatus() {
    this.resetState();
    if(true == wifiStore.getConnectChosenWifiStatus()) {
      this.inspector_PC = true;
      this.setState({
        connectedType: 'wifi',
        nodes: nodeStore.getUnusedElectronicNodes()
      });
    } else {
      this.inspector_PC = false;
      this.setState({connectedType: '', showUpdateWarning: false});
    }
  }

  bleOrWifiWillMount() {
    let self = this;
    self.resetState();
    if('connected' == linkStore.getStatus()) {
      self.inspector_PC = true;
      self.setState({
        connectedType: 'ble',
        nodes: nodeStore.getUnusedElectronicNodes()
      });
    } else if(true == wifiStore.getConnectChosenWifiStatus()) {
      self.inspector_PC = true;
      self.setState({
        connectedType: 'wifi',
        nodes: nodeStore.getUnusedElectronicNodes()
      });
      self._wifiRunningStatus = wifiStore.getWifiRunningStatus();
      if(self._wifiRunningStatus == 'running') {
        self._showConnectedWifiIcon = 'showWifiEqualIcon';
        self._showConnectedWifiRunningDiv = 'showWifiRunning';
        self.setState({
          reRender: false
        });
      }
    } else {
      self.inspector_PC = false;
      self.setState({connectedType: ''});
    }
  }

  wifiRunningStatus() {
    this.resetState();
    this._wifiRunningStatus = wifiStore.getWifiRunningStatus();
    if(this._wifiRunningStatus == 'running') {
      this._showConnectedWifiIcon = 'showWifiEqualIcon';
      this._showConnectedWifiRunningDiv = 'showWifiRunning';
      this.setState({
        reRender: false
      });
    } else {
      this._showConnectedWifiIcon = 'showWifiIcon';
      this._showConnectedWifiStoppedDiv = '';
      this._showConnectedWifiRunningDiv = '';
      this.setState({
        reRender: false
      });
    }
  }

  uploadCodeStatusChange() {
    this._uploadCodeSuc = wifiStore.getUploadSuc();
    this._wifiRunningStatus = 'stopped';
    this._showConnectedWifiStoppedDiv = 'showCoverResult';
    this.setState({
      reRender: false
    });
  }

  showServerUpdateDialog() {
    wifiServerStore.showUpdateDialog();
  }

  updateWarning() {
    return (<div className={'update-warning-div '+(this.state.showUpdateWarning == true? '': 'hide')}
      {...tapOrClick(this.showServerUpdateDialog.bind(this))}>
      {languages.getTranslation('wifiUpdate-update-tips')}
    </div>);
  }

  showUpdateWarning(wifiAddr) {
    this.setState({
      showUpdateWarning: true
    });
    this._targetIp = wifiAddr;
  }

  componentWillMount(){
    this.bleOrWifiWillMount();
  }

  componentDidMount() {
    // load nodes from engine and setState
    let self = this;
    console.log(self.props.projectId);
    this.getUnusedElectronicNodesFunc = this.getUnusedElectronicNodes.bind(this);
    this.bleConnectedFunc = this.BlechangeStatus.bind(this);
    this.wifiConnectedFunc = this.WifiChangeStatus.bind(this);
    this.wifiRunningStatusFunc = this.wifiRunningStatus.bind(this);
    this.uploadCodeStatusChangeFunc = this.uploadCodeStatusChange.bind(this);
    this.showUpdateWarningFunc = this.showUpdateWarning.bind(this);

    nodeStore.on('ElectronicNodesListChange', this.getUnusedElectronicNodesFunc);

    linkStore.on('statusChange', this.bleConnectedFunc);

    wifiStore.on('wifiConnected', this.wifiConnectedFunc);
    wifiStore.on('wifiRunningStatus', this.wifiRunningStatusFunc);
    wifiStore.on('uploadCodeStatusChange', this.uploadCodeStatusChangeFunc);
    wifiStore.on('needUpdate', this.showUpdateWarningFunc);
    this.getUnusedElectronicNodesFunc();
    this._register = AppDispatcher.register((action) => {
      if (action.actionType == AppConstants.SHELF_SHOW_DELETE) {
        if(this._showDelete != action.showDelete) {
          this._showDelete = action.showDelete;
          this.setState({
            reRender: false
          });
        }
      } else if(action.actionType == AppConstants.UPDATE_WIFI_SUCCESS) {
        self.setState({
          showUpdateWarning: false
        });
      }
      if(action.actionType === AppConstants.SYNC_UPDATE_FIRMWARE) {
        this.getUnusedElectronicNodesFunc();
      }
    });
  }

  componentWillUnmount(){
    nodeStore.off('ElectronicNodesListChange', this.getUnusedElectronicNodesFunc);
    linkStore.off('statusChange', this.bleConnectedFunc);
    wifiStore.off('wifiConnected', this.wifiConnectedFunc);
    wifiStore.off('wifiRunningStatus', this.wifiRunningStatusFunc);
    wifiStore.off('uploadCodeStatusChange', this.uploadCodeStatusChangeFunc);
    wifiStore.off('needUpdate', this.updateServerFunc);
    AppDispatcher.unregister(this._register);
  }
}

export { Shelf };
