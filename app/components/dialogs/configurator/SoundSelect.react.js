import React, { Component } from 'react';
import tapOrClick from 'react-tap-or-click';
import languages from '../../../languages';
import UIActions from '../../../actions/UIActions';
import AppDispatcher from '../../../dispatcher/AppDispatcher';
import AppConstants from '../../../constants/AppConstants';
import soundStore from '../../../stores/soundStore';
import nodeStore from '../../../stores/nodeStore';

class SoundList extends Component {
  constructor() {
    super(...arguments);
    console.log('record', nodeStore.getCurrentConfig(this.props.id, 'record'));
    this.state = {
      showDelete: false,
      soundList: this.props.soundList,
      currentRecord: nodeStore.getCurrentConfig(this.props.id, 'record')
    };

    this.currentPlay = '';

  }
  renderSoundList() {
    let list = [];
    if (this.state.soundList && this.state.soundList.length > 0) {
      let self = this;
      this.state.soundList.map((soundName, index)=> {
        if(soundName === this.state.currentRecord) {
          list.push(<li className='sound-detail selected' key={soundName} data-value={index} data-soundname={soundName} {...tapOrClick(self.onConfigSelect.bind(this))}>
            <img className="icon-play" src="img/icon-sound-play-active.png" alt=""/>
            <span className='sound-name'>{soundName}</span>
            <div className="operate-wrap">
              <span className={'icon-sound-delete '+(self.state.showDelete==true? 'hide':'')} {...tapOrClick(self.tapToShowDeleteIcon.bind(self))}>{languages.getTranslation('sound-edit')}</span>
              <div className={'deleteOrNot '+(self.state.showDelete == true? 'show': '')}>
                <span className='icon-delete-btn'{...tapOrClick(self.cancel.bind(self))}>{languages.getTranslation('cancel')}</span>
                <span className='icon-confirm-btn'{...tapOrClick(self.confirm.bind(self))}>{languages.getTranslation('sound-delete')}</span>
              </div>
            </div>
          </li>);
        }else {
          list.push(<li className='sound-detail' key={soundName} data-value={index} data-soundname={soundName} {...tapOrClick(self.onConfigSelect.bind(this))}>
            <img className="icon-play" src="img/icon-sound-play.png" alt=""/>
            <span className='sound-name'>{soundName}</span>
            <div className="operate-wrap hide">
              <span className={'icon-sound-delete '+(self.state.showDelete==true? 'hide':'')} {...tapOrClick(self.tapToShowDeleteIcon.bind(self))}>{languages.getTranslation('sound-delete')}</span>
              <div className={'deleteOrNot '+(self.state.showDelete == true? 'show': '')}>
                <span className='icon-delete-btn'{...tapOrClick(self.cancel.bind(self))}>{languages.getTranslation('cancel')}</span>
                <span className='icon-confirm-btn'{...tapOrClick(self.confirm.bind(self))}>{languages.getTranslation('icon-confirm-ok')}</span>
              </div>
            </div>
          </li>);
        }

      });
      return list;
    }
  }

  onConfigSelect(e) {
    if(e.target.classList.contains('sound-detail') || e.target.classList.contains('icon-play') || e.target.classList.contains('sound-name')) {
      let soundName = e.target.closest('.sound-detail').dataset.soundname;
      console.log('[record]', soundName);
      this.currentPlay = soundName;
      UIActions.configNode(this.props.id, {record: soundName}, true);
      this.setState({
        currentRecord: soundName,
        showDelete: false
      });
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
    this.currentPlay = '';
  }

  tapToShowDeleteIcon() {
    this.setState({
      showDelete: true
    });
  }

  render() {
    return (<div className='sound-list-management'>
        <div className='sound-management-text'>{languages.getTranslation('record-management')}</div>
      <ul className={'sound-list '+(this.props.isShow == 'record'?'':'hide')}>{this.renderSoundList()}</ul>
    </div>);
  }

  updateSoundList(list) {
    this.setState({
      isActive: true,
      soundList: list,
    });
  }

  componentDidMount() {
    this._register = AppDispatcher.register((action) => {
      if (action.actionType === AppConstants.NODE_TAP) {
        if(this.props.id === action.nodeId) {
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

class SoundSelect extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      name: '',
      type: this.props.type,
      id: this.props.id,
      curTab: this.props.config.soundType.defaultValue || nodeStore.getCurrentConfig(this.props.id, 'soundEffect'),
      soundEffect: this.props.config.soundEffect.defaultValue,
      reRender: false
    };
    this.changeTab = this.changeTab.bind(this);
    this.renderEffectList = this.renderEffectList.bind(this);
    this.renderTab = this.renderTab.bind(this);
  }
  playEffect(e) {
    let val = e.target.dataset.effect;
    this.setState({
      soundEffect: val
    });
    UIActions.configNode(this.props.id, {soundEffect: val}, true);
  }

  changeTab(e) {
    //e.persist();
    if(e.target.classList.contains('play-sound-effect')) {
      let type = e.target.dataset.action;
      if(type === 'record') {
        soundStore.fetchData(this.props.id);
        this.setState({
          curTab: e.target.dataset.action,
          reRender: this.state.reRender === false? true: false
        });
      } else {
        this.setState({
          curTab: e.target.dataset.action
        });
      }
      UIActions.configNode(this.props.id, {soundType: type}, false);
    }

  }

  onConfigSelect(key, value){
    this.props.onChange && this.props.onChange('record', value);
    this.curPlay = value;
  }

 /* showSoundList() {
    soundStore.requestSoundList(this.state.id, 'show');
  }*/

  listChange(newSoundList) {
    if(newSoundList.indexOf(this.curPlay) == -1) {
      this.curPlay = '';
    }
  }

  renderTab() {
    let list = this.props.config.soundType.options;
    let arr = [];
    if(list && list.length > 0) {
      list.map((name) => {
        arr.push(<span key={name} className={'play-sound-effect '+(name === this.state.curTab ? 'selected': '')} data-action={name} ref={name}>{languages.getTranslation('play-sound-' + name)}</span>);
      });
    }
    return arr;
  }

  renderEffectList() {
    let list = this.props.config.soundEffect.options;
    let arr = [];
    if(list && list.length > 0) {
      list.map((name) => {
        arr.push(<li key={name} className={'play-effect-div ' + (name === this.state.soundEffect ? 'selected': '')}><img className='icon-sound-effect' data-effect={name} src={'img/soundEffect/icon-sound-' + name +'.png'} {...tapOrClick(this.playEffect.bind(this))} /></li>);
      });
    }
    return arr;
  }

  render() {
    return (<div className={this.props.type + '-content'}>
      <div className='play-type' {...tapOrClick(this.changeTab)} ref='playType'>
        {this.renderTab()}
      </div>
      <ul className='sound-category'>{this.state.curTab === 'effect' ? this.renderEffectList() : <SoundList id={this.state.id} isShow={this.state.curTab} soundList={soundStore.getSoundList()} defaultValue={this.props.config.record.defaultValue}/>}</ul>
    </div>);
  }


  componentDidMount() {
    let self = this;
    this._register = AppDispatcher.register((action) => {
      if (action.actionType === AppConstants.NODE_TAP) {
        if(self.props.id === action.nodeId && self.state.curTab === 'record') {
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

export { SoundList, SoundSelect };