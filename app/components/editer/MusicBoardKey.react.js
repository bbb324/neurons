/**
 * Created by KongyunWu on 2017/3/31.
 */
import React, { Component } from 'react';
import tapOrClick from 'react-tap-or-click';
import UIActions from '../../actions/UIActions';
import languages from '../../languages';
import MusicBoardStore from '../../stores/MusicBoardStore';
//import AppDispatcher from '../../dispatcher/AppDispatcher'
//import AppConstants from '../../constants/AppConstants';
//import engine from '../../core/FlowEngine';
require('./editer.less');

const boardWhiteKeys = ['F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'];
const endWhiteKeys = ['f3', 'g3', 'a3', 'b3', 'c4', 'd4', 'e4', 'f4', 'g4', 'a4', 'b4', 'c5', 'd5', 'e5', 'f5'];
const boardBlackKeys = ['F3#', 'G3#', 'A3#', 'C4#', 'D4#', 'F4#', 'G4#', 'A4#', 'C5#', 'D5#'];
const endBlackKeys = ['f3m', 'g3m', 'a3m', 'c4m', 'd4m', 'f4m', 'g4m', 'a4m', 'c5m', 'd5m'];
const musicNotes = [
  {key: '1', value: languages.getTranslation('all-note'), endKey: '1'},
  {key: '1/2', value: languages.getTranslation('half-note'), endKey: '2'},
  {key: '1/4', value: languages.getTranslation('quarter-note'), endKey: '4'},
  {key: '1/8', value: languages.getTranslation('eighth-note'), endKey: '8'}
];

class MusicBoardKey extends Component {
  constructor () {
    super(...arguments);
    this.state = {
      isShow: false,
      nodeId: ''
    };
    this.initWhiteKeys = this.initWhiteKeys.bind(this);
    this.initBlackKeys = this.initBlackKeys.bind(this);
    this.toggleNote = this.toggleNote.bind(this);
    this.onChange = this.onChange.bind(this);

    this.keyValue = '';
    this.endKeyValue = '';
  }

  initWhiteKeys(keys) {
    let arr = [];
    if(keys instanceof Array && keys.length >0) {
      keys.forEach((value, key)=>{
        arr.push(<li className="white-key" data-value={value} key={key}></li>);
      });
    }
    return arr;
  }

  initBlackKeys(keys) {
    let arr = [];
    if(keys instanceof Array && keys.length >0) {
      keys.map((value, key)=>{
        arr.push(<li data-value={value} key={key}><div className="rectangle"></div></li>);
      });
    }
    return arr;
  }

  initMeterNote (keys) {
    let arr = [];
    if(keys instanceof Array && keys.length >0) {
      keys.map((item, key) => {
        arr.push(<span data-value={item.key} key={key} >{item.value} </span>);
      });
    }
    return arr;
  }

  toggleNote(e) {
    let target = e.target;
    if(target.tagName.toUpperCase() === 'SPAN' && !target.classList.contains('active')) {
      let parent = target.parentNode;
      let children = parent.childNodes;
      let keyValue = target.getAttribute('data-value');
      let endKeyValue = '';
      for(let i=0; i<children.length; i++) {
        children[i].classList.remove('active');
      }
      target.classList.add('active');
      UIActions.musicChangeMeter(target.getAttribute('data-value'), this.state.nodeId);

      for(let value of musicNotes) {
        if(value['key'] === keyValue) {
          endKeyValue = value['endKey'];
          break;
        }
      }
      UIActions.configNode(this.state.nodeId, {length: endKeyValue});
    }

  }

  onStart(e) {
    e.preventDefault();
    let target = e.target;
    let keyValue = '';
    let endKeyValue = '';
    if(target.classList.contains('white-key')) {
      keyValue = target.getAttribute('data-value');
      endKeyValue = endWhiteKeys[boardWhiteKeys.indexOf(keyValue)];
      target.classList.add('active');
      this.keyValue = keyValue;
      this.endKeyValue = endKeyValue;
    }
    if(target.classList.contains('rectangle')) {
      target.parentNode.classList.add('active');
      keyValue = target.parentNode.getAttribute('data-value');
      endKeyValue = endBlackKeys[boardBlackKeys.indexOf(keyValue)];
      this.keyValue = keyValue;
      this.endKeyValue = endKeyValue;
    }
    /*this.key, this.endKeyValue赋值为了防止点到黑键与白键的空白区域，取不到key，用原来的key显示在UI，但是Engine不发声音*/

    //transfer data to 'playMusic' Node
    UIActions.musicChangeKeyValue(keyValue || this.keyValue, this.state.nodeId);

    //transfer data to engine
    UIActions.configNode(this.state.nodeId, {tune: endKeyValue || this.endKeyValue}, (endKeyValue ? true : false));
  }

  onEnd(e) {
    e.preventDefault();
    let target = e.target;

    if(target.classList.contains('white-key') || target.classList.contains('rectangle')) {
      if(target.classList.contains('white-key')) {
        target.classList.remove('active');

      }
      if(target.classList.contains('rectangle')) {
        target.parentNode.classList.remove('active');
      }

    }
  }

  onChange() {
    let self = this;
    let isShowBoard = MusicBoardStore.isShowBoard;
    if(isShowBoard && !self.refs.musicBoard.classList.contains('show-music-board')) {
      self.refs.musicBoard.classList.add('show-music-board');
      self.setState({
        isShow: isShowBoard,
        nodeId: MusicBoardStore.nodeId
      });

      //set default value of meter
      let index;
      if(MusicBoardStore.meterValue) {
        setTimeout(function () {
          let meterLists = self.refs.musicBoard.querySelectorAll('.board-meter span');
          for(let i=0; i<meterLists.length; i++) {
            meterLists[i].classList.remove('active');
            if(meterLists[i].getAttribute('data-value') === MusicBoardStore.meterValue) {
              index = i;
            }
          }
          (index || index === 0) && meterLists[index].classList.add('active');
        }, 0);
      }
    }
    if(!isShowBoard && self.state.nodeId && self.refs.musicBoard.classList.contains('show-music-board')) {
      self.refs.musicBoard.classList.remove('show-music-board');
    }

  }

  hideBoard() {
    if(this.refs.musicBoard.classList.contains('show-music-board')) {
      this.refs.musicBoard.classList.remove('show-music-board');
    }
  }

  renderBody() {
    let self = this;
    return (
      <div className="section-wrap">
        <div className="board-meter" {...tapOrClick(self.toggleNote)}>
          {this.initMeterNote(musicNotes)}
          <div className="confirm" {...tapOrClick(self.hideBoard.bind(self))}>{languages.getTranslation('dialog-action-confirm')}</div>
          </div>
        <div className="board-key"
             onTouchStart={this.onStart.bind(this)}
             onTouchEnd={this.onEnd.bind(this)}>
          <ul className="white-key-list">{this.initWhiteKeys(boardWhiteKeys)}</ul>
          <ul className="black-key-list">{this.initBlackKeys(boardBlackKeys)}</ul>
        </div>
      </div>
    );
  }

  render () {
    return <div className="music-board" ref='musicBoard'>{this.state.isShow ? this.renderBody() : ''}</div>;
  }

  componentDidMount() {
    MusicBoardStore.addShowBoard(this.onChange);
    MusicBoardStore.addMusicSyncConfigurator(this.onChange);
  }

  componentWillUnmount() {
    MusicBoardStore.removeShowBoard(this.onChange);
    MusicBoardStore.removeMusicSyncConfigurator(this.onChange);
  }
}

export { MusicBoardKey };
