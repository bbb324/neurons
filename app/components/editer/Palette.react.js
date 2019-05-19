import React, { Component } from 'react';
import nodeFactory from '../nodes/nodeFactory.js';
import { TouchHandler } from './TouchHandler';
import editerStore from '../../stores/editerStore';
import tapOrClick from 'react-tap-or-click';
import languages from '../../languages';
import AppDispatcher from '../../dispatcher/AppDispatcher';
import AppConstants from '../../constants/AppConstants';
import engine from '../../core/FlowEngine';
import {engineGetUUID} from '../../core/FlowEngine';
require('./editer.less');
require('./../nodes/SubPalette.less');

class NodeTouchHandler extends TouchHandler {
  constructor() {
    super(...arguments);
    this.canMove = false;
    this.draggingObject = null;
    this._canMoveEvent = false;
    this._maxDiffTime = 50;
    this._lastMoveNodeTime = 0;
    this._currentMoveNodeTime = 0;
  }

  onStart(e) {
    if ( e.target.closest('.node-preview') && e.touches.length == 1) {
      let tmp = e.target.closest('.node-preview');
      this.canMove = true;
      this._canMoveEvent = false;
      this.baseTop = this._getOffsetRect(tmp).top - parseInt(window.getComputedStyle(tmp).marginTop);
      this.baseLeft = this._getOffsetRect(tmp).left - parseInt(window.getComputedStyle(tmp).marginLeft);
      this.draggingObject = tmp.cloneNode(true);
      this.draggingObject.style.position = 'absolute';
      this.draggingObject.classList.add('fakeNode');
      this.draggingObject.querySelector('.node-preview-name').remove();
      this.draggingObject.style.top = this.baseTop + 'px';
      this.draggingObject.style.left = this.baseLeft + 'px';
      this.touchX = this._touches(e)[0].pageX;
      this.touchY = this._touches(e)[0].pageY;
      document.querySelector('.editer-main').appendChild(this.draggingObject);
    }

  }

  onMove(e) {
    if (this.canMove) {
      this._currentMoveNodeTime = new Date().getTime();
      let diffTime = this._currentMoveNodeTime - this._lastMoveNodeTime;
      if(diffTime <= this._maxDiffTime) {
        return;
      }
      this._lastMoveNodeTime = this._currentMoveNodeTime;
      let deltaX = this._touches(e)[0].pageX - this.touchX;
      let deltaY = this._touches(e)[0].pageY - this.touchY;
      this.draggingObject.style.top = this.baseTop + deltaY + 'px';
      this.draggingObject.style.left = this.baseLeft + deltaX + 'px';
      if(!this._canMoveEvent) {
        this._canMoveEvent = true;
        this.container.emitter.emit('beginMovingNodeToCanvas');
      }
    }
  }

  onEnd(e) {
    if (this.canMove) {
      this.canMove = false;
      if (this.draggingObject) {
        this.draggingObject.remove();
      }
      var elem = document.elementFromPoint(this._touches(e)[0].pageX, this._touches(e)[0].pageY);
      if (!elem.closest('.editer-palette-nodes')) {
        let nodeInfo = {
          left: parseInt(this.draggingObject.style.left),
          top: parseInt(this.draggingObject.style.top),
          ins: [],
          outs: [],
          type: this.draggingObject.dataset.type,
          category: this.draggingObject.dataset.category
        };
        this.container.emitter.emit('addNode', nodeInfo);

        if (window._runtime == 'cordova') {
          window.ga.trackEvent('createNode', this.draggingObject.dataset.type);
        }
      }
    }
  }
  onCancel() {
    this.draggingObject.remove();
  }
}

class Palette extends Component {
  constructor() {
    super(...arguments);
    this.emitter = this.props.emitter;
    this.touchHandler = new NodeTouchHandler(this);
    this._showDelete = false;
    this.state = {
      category: 'common',
      reRender: false,
      tabList: [],
      nodesList: [],
      videoSrc: '',
      showVideo: false
    };
    this.sound = false; // if audio nodes mounted set it to true
    this.camera = false; // if video nodes mounted set it to true
    this.tabUnit1 = 103;  // on iPad using 103px as one tab unit
    this.tabUnit2 = 12; // on phone side using 12vw as one tab unit
    this.setInitTabWidth();

  }

  setInitTabWidth() {
    let width = window.innerWidth > window.innerHeight ? window.innerWidth : window.innerHeight;
    if(width < 1024) {
      this.initWidth = 'calc(' + this.tabUnit2 * 2 + 'vw + 2px)';
    }else {
      this.initWidth = (this.tabUnit1 * 2) + 2 + 'px'; // 2px is the border
    }
  }

  insertHardWare() {
    let width = window.innerWidth > window.innerHeight ? window.innerWidth : window.innerHeight;
    if (width < 1024) {
      let value = parseInt(this.initWidth.match(/\d+/)[0]);
      value += this.tabUnit2;
      this.initWidth = 'calc(' + value + 'vw + 2px)';
    } else {
      let value = parseInt(this.initWidth.match(/\d+/)[0]);
      value += this.tabUnit1;
      this.initWidth = value + 'px';
    }
  }

  removeHardWare() {
    let width = window.innerWidth > window.innerHeight ? window.innerWidth : window.innerHeight;
    if (width < 1024) {
      let value = parseInt(this.initWidth.match(/\d+/)[0]);
      value -= this.tabUnit2;
      this.initWidth = 'calc(' + value + 'vw + 2px)';
    } else {
      let value = parseInt(this.initWidth.match(/\d+/)[0]);
      value -= this.tabUnit1;
      this.initWidth = value + 'px';
    }
  }

  //get audio or video connect status, when open new project, set tabList width
  getAudioStatus() {
    let status = engine.getavblockState();
    if(status.sound == 'connected' || status.camera == 'connected') {
      if(status.sound == 'connected') {
        this.sound = true;
        this.insertHardWare();
      }
      if(status.camera == 'connected') {
        this.camera = true;
        this.insertHardWare();
      }
    }
    this.setTabNames();
  }

  // when init palette, do not render sound or camera nodes, until they are mounted
  setTabNames() {
    let tabList = [];
    for(let type in this.props.nodeTypes){
      if(tabList.indexOf(this.props.nodeTypes[type].props.category)==-1 &&
        this.props.nodeTypes[type].props.assistanceNode == undefined &&
        this.props.nodeTypes[type].props.category != 'electronic') {
        if(this.props.nodeTypes[type].props.category == 'sound' && this.sound == false){
          continue;
        } else if(this.props.nodeTypes[type].props.category == 'camera' && this.camera == false){
          continue;
        } else {
          tabList.push(this.props.nodeTypes[type].props.category);
        }
      }
    }
    tabList = this.setSeq(tabList);

    this.setState({
      tabList: tabList
    });
  }

  //sort tabList, set sound as second
  setSeq(tabList) {
    let iconSound = tabList.splice(tabList.indexOf('sound'), 1).toString();
    let iconCamera = tabList.splice(tabList.indexOf('camera'), 1).toString();
    tabList.splice(2,0, iconSound);
    tabList.splice(3,0, iconCamera);
    return tabList;
  }

  renderTabs(){
    let tabs = [];
    for(let tabName in this.state.tabList){
      tabs.push(<li key={tabName} data-tab={this.state.tabList[tabName]} className={'tab-name '+(this.state.tabList[tabName]==this.state.category?'active':'')} {...tapOrClick(this.switchTab.bind(this))}>{languages.getTranslation(this.state.tabList[tabName])}<span className='tab-separate'></span></li>);
    }
    return (<ul className='tabs ' style={{width: this.initWidth}} ref='tabNames'>{tabs}</ul>);
  }

  setNodeList() {
    this.setState({
      nodesList: this.props.nodeTypes
    });
  }

  renderNodes() {
    let nodes = [];
    for (let type in this.state.nodesList) {
      if (this.state.nodesList[type].props.category == this.state.category && nodeFactory[type]) {
        let Node = nodeFactory[type];
        nodes.push(
          <Node isPreview={true} info={this.state.nodesList[type]} key={type}/>
        );
      }
    }
    return nodes;
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

  switchTab(e){
    this.setState({
      category: e.target.dataset.tab
    });
  }

  /* expand or shrink tab
  * when shrink tabs, if current active is neither 'common' nor 'control', set common tab as active, if 'control' do nothing
  *
  */
  onToggleTabDisplay(e){
    let palette = e.target.closest('.editer-palette-tab');
    let shrinkOption = ['advanced', 'time'];
    if(this.sound == true && this.camera == true) {
      palette.querySelector('.tabs').classList.toggle('shrink-with-two-mounted-node');
    } else if(this.sound == true || this.camera == true){
      palette.querySelector('.tabs').classList.toggle('shrink-with-one-mounted-node');
    } else if(this.sound == false && this.camera == false) {
      palette.querySelector('.tabs').classList.toggle('shrink-with-zero-mounted-node');
    }
    palette.querySelector('.icon-tab-arrow').classList.toggle('direction');
    if (shrinkOption.indexOf(this.state.category) != -1) {
      this.setState({
        category: 'common'
      });
    }
  }

  //display or hide video camera
  onToggleCameraFrameDisplay() {
    let addr = 'http://'+engine.getWifiServerIp();
    let srcOpen = addr + ':8329/live?uuid=' + engineGetUUID();
    let srcClose = addr + ':8329/stop?uuid=' + engineGetUUID();
    this.refs.camera.querySelector('.one').classList.toggle('one-onclick');
    this.refs.camera.querySelector('.four').classList.toggle('four-onclick');
    this.refs.camera.querySelector('.six').classList.toggle('six-onclick');
    this.refs.camera.querySelector('.nine').classList.toggle('nine-onclick');
    this.setState({
      videoSrc: this.state.showVideo == true ? srcClose : srcOpen,
      showVideo: this.state.showVideo==true? false: true
    });
  }

  render() {
    console.log('Palette.react.js: videoSrc:', this.state.videoSrc);
    return (
      <div className={'editer-palette '} ref='mainPaletteTab'>
        <div className='editer-palette-tab'>
          {this.renderTabs()}
          <div className='expand tabs-control' {...tapOrClick(this.onToggleTabDisplay.bind(this))}>
            <img className='icon-tab-arrow' src='img/icon-palette-tab.png' />
          </div>
        </div>
        <div className="editer-palette-nodes"
          onTouchStart={this.onStart.bind(this)}
          onTouchMove={this.onMove.bind(this)}
          onTouchEnd={this.onEnd.bind(this)}
          onTouchCancel={this.onCancel.bind(this)}
          ref='editerPalette'>
          {this.renderNodes()}
        </div>
        <div className={'video-frame '+(this.state.showVideo == true?'':'hide')}>
          <img src={this.state.videoSrc} width='320' height='240'/>
        </div>
        <div className={'editer-palette-video-camera '+(this.state.category == 'camera'?'':'hide')} {...tapOrClick(this.onToggleCameraFrameDisplay.bind(this))} ref='camera'>
          <div className='camera'>
            <div className='circle one'></div>
            <div className='circle two'></div>
            <div className='circle three'></div>
            <div className='circle four'></div>
            <div className='circle five'></div>
            <div className='circle six'></div>
            <div className='circle seven'></div>
            <div className='circle eight'></div>
            <div className='circle nine'></div>
          </div>
        </div>
        <div className='palette-div-delete' style={{display: this._showDelete ? 'block' : 'none'}}>
          <img className='icon-drag-delete' src={'img/icon-delete-red.png'}/>
        </div>
      </div>
    );
  }

  togglePalette(){
    let activeInfo = editerStore.getActiveNode();
    if(activeInfo) {
      if(this.props.nodeTypes[activeInfo.type].props && this.props.nodeTypes[activeInfo.type].props.hasassistanceNode == true) {
        this.refs.mainPaletteTab.classList.add('hide-mainPalette');
      }
    }
    else {
      this.refs.mainPaletteTab.classList.remove('hide-mainPalette');
    }
  }

  mountNode(MountedNode) {
    if(MountedNode.state == 'connected') {
      if(this.state.tabList.indexOf(MountedNode.category) !=-1) {
        return;
      }
      this.insertHardWare();
      this[MountedNode.category] = true;
      let newTabList = this.state.tabList;
      newTabList.splice(2,0,MountedNode.category);
      this.setState({
        tabList: newTabList,
        category: MountedNode.category,
      });
      if(this.refs.tabNames.classList.contains('shrink-with-zero-mounted-node')) {
        this.refs.tabNames.classList.remove('shrink-with-zero-mounted-node');
        this.refs.tabNames.classList.add('shrink-with-one-mounted-node');
      } else if (this.refs.tabNames.classList.contains('shrink-with-one-mounted-node')) {
        this.refs.tabNames.classList.remove('shrink-with-one-mounted-node');
        this.refs.tabNames.classList.add('shrink-with-two-mounted-node');
      }

    } else {
      this[MountedNode.category] = false;
      let newTabList = this.state.tabList;
      newTabList.splice(newTabList.indexOf(MountedNode.category), 1);
      this.removeHardWare();
      this.setState({
        tabList: newTabList,
        category: 'common',
        videoSrc: '',
        showVideo: false
      });
      if(this.refs.tabNames.classList.contains('shrink-with-two-mounted-node')) {
        this.refs.tabNames.classList.remove('shrink-with-two-mounted-node');
        this.refs.tabNames.classList.add('shrink-with-one-mounted-node');
      } else if (this.refs.tabNames.classList.contains('shrink-with-one-mounted-node')) {
        this.refs.tabNames.classList.remove('shrink-with-one-mounted-node');
        this.refs.tabNames.classList.add('shrink-with-zero-mounted-node');
      }
    }
  }

  componentDidMount() {
    this.getAudioStatus();
    this.setNodeList();
    this.toggleConfigFunc = this.togglePalette.bind(this);
    editerStore.on('activateNode', this.toggleConfigFunc);
    this.mountNodeFunc = this.mountNode.bind(this);
    engine.on('CategoryChanged', this.mountNodeFunc);
    this._register = AppDispatcher.register((action) => {
      if (action.actionType == AppConstants.PALETTE_SHOW_DELETE) { 
        if(this._showDelete != action.showDelete) {
          this._showDelete = action.showDelete;
          this.setState({
            reRender: false
          });
        }
      }
    });
  }

  componentWillUnmount(){
    editerStore.off('activateNode', this.toggleConfigFunc);
    engine.removeListener('CategoryChanged', this.mountNodeFunc);
    engine.removeListener('activateNode', this.toggleConfigFunc);
    AppDispatcher.unregister(this._register);
  }
}

export { Palette };