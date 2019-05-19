/**
 * Created by junxie on 17/3/29.
 */
import React, { Component } from 'react';
import { Select } from './Select.react';
import tapOrClick from 'react-tap-or-click';
import languages from '../../languages';
import UIActions from '../../actions/UIActions';
import AppDispatcher from '../../dispatcher/AppDispatcher';
import AppConstants from '../../constants/AppConstants';
import soundStore from '../../stores/soundStore';

class SoundList extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      isActive: false,
      showDelete: false,
      soundList: this.props.soundList
    };

  }
  renderSoundList() {
    if (this.state.soundList && this.state.soundList.length != 0) {
      let list = [];
      let self = this;
      this.state.soundList.map((soundName, index)=> {
        list.push(<li className='sound-detail' key={soundName} data-value={index}><span
          className='sound-name'>{soundName}</span>
        <span
          className={'icon-sound-delete '+(self.state.showDelete==true? 'hide':'')} {...tapOrClick(self.tapToSHowDeleteIcon.bind(self))}>
          {languages.getTranslation('sound-delete')}
        </span>
          <div className={'deleteOrNot '+(self.state.showDelete == true? 'show': '')}>
            <span className='icon-delete-btn'{...tapOrClick(self.cancel.bind(self))}>{languages.getTranslation('cancel')}</span>
            <span className='icon-confirm-btn'{...tapOrClick(self.confirm.bind(self))}>{languages.getTranslation('icon-confirm-ok')}</span>
          </div>
        </li>);
      });
      return list;
    }
  }

  cancel() {
    this.setState({
      showDelete: false
    });
  }

  confirm(e) {
    this.setState({
      showDelete: true
    });
    let option = e.target.closest('.sound-detail').dataset.value;
    soundStore.deleteSound(this.props.id, option);
  }

  tapToSHowDeleteIcon() {
    this.setState({
      showDelete: true
    });
  }

  closeList() {
    this.setState({
      isActive: false,
      showDelete: false
    });
    this.props.closeList && this.props.closeList(true);
  }

  render() {
    return (<div className={'sound-list-management '+(this.state.isActive == true?'show-list':'')}>
      <div className='sound-list-management-title'>
        <span className='sound-management-txt'>{languages.getTranslation('record-management')}</span><img {...tapOrClick(this.closeList.bind(this))} src='img/icon-close.png'/>
      </div>
      <ul className={'sound-list '+(this.props.isShow == 'record'?'':'hide')}>{this.renderSoundList()}</ul>
    </div>);
  }

  updateSoundList(list, type) {
    if(type == 'show') {
      this.setState({
        isActive: true,
        soundList: list
      });
    }
  }

  componentDidMount() {
    this._register = AppDispatcher.register((action) => {
      if (action.actionType == AppConstants.NODE_TAP) {
        if(this.props.id == action.nodeId) {
          this.closeList();
        }
      }
    });
    this.updateSoundListFunc = this.updateSoundList.bind(this);
    soundStore.on('SoundListLoadFinished', this.updateSoundListFunc);
  }

  componentWillUnmount() {
    AppDispatcher.unregister(this._register);
    soundStore.off('SoundListLoadFinished', this.updateSoundListFunc);
  }

}

class PlaySound extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      name: '',
      id: this.props.id,
      curTab: this.props.configs.soundType.defaultValue,
      soundEffect: this.props.configs.soundEffect.defaultValue,
      reRender: false
    };
  }
  playEffect(e) {
    let val = e.target.dataset.effect;
    this.setState({
      soundEffect: val
    });
    UIActions.configNode(this.props.nodeId, {soundEffect: val}, true);
  }

  changeTab(e) {
    e.persist();
    let confirmBtn = e.target.closest('.node-config').querySelector('.confirm');
    if(e.target.dataset.action == 'record') {
      soundStore.fetchData(this.props.id);
      confirmBtn.style.display = 'none';
      this.setState({
        curTab: e.target.dataset.action,
        reRender: this.state.reRender == false ? true: false
      });
    } else {
      confirmBtn.style.display = 'flex';
      this.setState({
        curTab: e.target.dataset.action
      });
    }
    this.props.onChange && this.props.onChange('soundType', e.target.dataset.action);
  }

  onConfigSelect(key, value){
    this.props.onChange && this.props.onChange('record', value);
    this.curPlay = value;
  }

  showSoundList() {
    soundStore.requestSoundList(this.state.id, 'show');
  }

  listChange(newSoundList) {
    if(newSoundList.indexOf(this.curPlay) == -1) {
      this.curPlay = '';
    }
  }

  onConfig(key, value) {
    this.props.onChange && this.props.onChange(key, value);
  }

  //forward or backward play sound
  SoundPlay(e) {
    let playList = soundStore.getSoundList();
    let onPlay;
    switch (e.currentTarget.dataset.action) {
    case 'prevSound':
      onPlay = playList[playList.indexOf(this.curPlay)-1];
      if(onPlay !=undefined ) {
        this.props.onChange && this.props.onChange('record', onPlay);
        this.curPlay = onPlay;
        if(this.refs.nextSound.src.indexOf('blur')!=-1) {
          this.refs.nextSound.src = 'img/icon-nextSound.png';
        }
        soundStore.soundChange(this.curPlay);
      } else {
        e.target.src = 'img/icon-prevSound-blur.png';
      }
      break;
    case 'curSound':
      this.props.onChange && this.props.onChange('record', this.curPlay);
      break;
    case 'nextSound':
      onPlay = playList[playList.indexOf(this.curPlay)+1];
      if(onPlay !=undefined ) {
        this.props.onChange && this.props.onChange('record', onPlay);
        this.curPlay = onPlay;
        if(this.refs.prevSound.src.indexOf('blur')!=-1) {
          this.refs.prevSound.src = 'img/icon-prevSound.png';
        }
        soundStore.soundChange(this.curPlay);
      } else {
        e.target.src = 'img/icon-nextSound-blur.png';
      }
      break;
    }
  }

  renderPanel() {
    if(this.state.curTab == 'effect') {
      return (<div className='play-effect'>
        <div className={'play-effect-div '+ (this.state.soundEffect == 'cat'?'is-selected-cat':'')}><span className='play-effect-icon cat'><img className='icon-sound-effect' data-effect='cat' src='img/soundEffect/icon-sound-miao.png' {...tapOrClick(this.playEffect.bind(this))} /></span></div>
        <div className={'play-effect-div '+ (this.state.soundEffect == 'dog'?'is-selected-dog':'')}><span className='play-effect-icon dog'><img className='icon-sound-effect' data-effect='dog' src='img/soundEffect/icon-sound-dog.png' {...tapOrClick(this.playEffect.bind(this))} /></span></div>
        <div className={'play-effect-div '+ (this.state.soundEffect == 'duck'?'is-selected-duck':'')}><span className='play-effect-icon duck'><img className='icon-sound-effect' data-effect='duck' src='img/soundEffect/icon-sound-duck.png' {...tapOrClick(this.playEffect.bind(this))} /></span></div>
        <div className={'play-effect-div '+ (this.state.soundEffect == 'alert'?'is-selected-alert':'')}><span className='play-effect-icon alert'><img className='icon-sound-effect' data-effect='alert' src='img/soundEffect/icon-sound-alert.png' {...tapOrClick(this.playEffect.bind(this))} /></span></div>
        <div className={'play-effect-div '+ (this.state.soundEffect == 'bell'?'is-selected-bell':'')}><span className='play-effect-icon bell'><img className='icon-sound-effect' data-effect='bell' src='img/soundEffect/icon-sound-bell.png' {...tapOrClick(this.playEffect.bind(this))} /></span></div>
      </div>);
    } else if(this.state.curTab == 'record') {
      let soundsOption = {options:soundStore.getSoundList(), defaultValue: this.curPlay || this.props.configs.record.defaultValue};
      return (<div className='sound-record'>
        <div className='sound-dropdown-list'>
          <Select config={soundsOption} selectStyle='playsound' onChange={this.onConfigSelect.bind(this)} />
          <div className='sound-management' {...tapOrClick(this.showSoundList.bind(this))}>{languages.getTranslation('record-management')}<img className='icon-right' src='img/icon-back.png'/></div>
        </div>
        <div className='play-action'>
          <div className='prevSound' data-action='prevSound' {...tapOrClick(this.SoundPlay.bind(this))}><img ref='prevSound' src='img/icon-prevSound.png' /></div>
          <div className='curSound' data-action='curSound' {...tapOrClick(this.SoundPlay.bind(this))}><img ref='curSound' src='img/icon-curSound.png' /></div>
          <div className='nextSound' data-action='nextSound' {...tapOrClick(this.SoundPlay.bind(this))}><img ref='nextSound' src='img/icon-nextSound.png' /> </div>
        </div>
      </div>);
    }
  }

  render() {
    return (<div className='play-sound'>
      <div className='play-type' {...tapOrClick(this.changeTab.bind(this))} ref='playType'>
        <span className={'play-sound-effect '+(this.state.curTab == 'effect'? 'is-selected': '')} data-action='effect' ref='effect'>{languages.getTranslation('play-sound-effect')}</span>
        <span className={'play-sound-record '+(this.state.curTab == 'record'? 'is-selected': '')} data-action='record' ref='record'>{languages.getTranslation('play-sound-record')}</span>
      </div>
      <div className='sound-category'>{this.renderPanel()}</div>
      <SoundList id={this.state.id} isShow={this.state.curTab} soundList={soundStore.getSoundList()} onChange={this.onConfig.bind(this)}/>
    </div>);
  }


  componentDidMount() {
    let self = this;
    let play = false;
    for ( let key in this.props.configs){
      if (this.props.configs[key].hasOwnProperty('defaultValue')){
        this.props.onChange && this.props.onChange( key, this.props.configs[key].defaultValue,play);
      }
    }
    if(this.state.curTab == 'record') {
      this.refs.playType.closest('.node-config').querySelector('.confirm').style.display = 'none';
    }

    this._register = AppDispatcher.register((action) => {
      if (action.actionType == AppConstants.NODE_TAP) {
        if(self.props.id == action.nodeId && self.state.curTab == 'record') {
          soundStore.fetchData(self.props.id);
        }
      }
    });

    self.listChangeFunc = self.listChange.bind(self);
    soundStore.on('listChange', self.listChangeFunc);
  }

  componentWillUnmount() {
    AppDispatcher.unregister(this._register);
    soundStore.off('listChange', self.listChangeFunc);
  }
}

export { PlaySound, SoundList };