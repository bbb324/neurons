import React, { Component } from 'react';
import tapOrClick from 'react-tap-or-click';
import UIActions from '../../actions/UIActions';
import languages from '../../languages';
import { SoundList } from './PlaySound.react';
import AppDispatcher from '../../dispatcher/AppDispatcher';
import AppConstants from '../../constants/AppConstants';
import soundStore from '../../stores/soundStore';

class SoundRecordManagement extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      name: this.props.name,
      id: this.props.id,
      curTab: '',
      soundList: [],
      saveState: true
    };
  }
  doToggle() {
    let value = this.state.saveState == false? true: false;
    this.setState({
      saveState: value
    });
    this.props.onChange && this.props.onChange('saveRecord', value);
  }

  editText(e) {
    if(this.state.saveState == true) {
      UIActions.editName(this.state.id, e.currentTarget.textContent, this.setName.bind(this));
    }
  }

  setName(value) {
    this.setState({
      name: value
    });
  }
  showSoundList() {
    this.refs.listManagement.closest('.node-config').classList.add('displaying-sound-list');
    soundStore.requestSoundList(this.state.id, 'show');
  }

  listClosed() {
    this.refs.listManagement.closest('.node-config').classList.remove('displaying-sound-list');
  }

  render(){
    return (<div className='sound-record-management-panel'>
      <div className='sound-record-management-div'>
        <span className='sound-title'>{languages.getTranslation('save-sound-file')}</span>
        <span className={'sound-toggle '+(this.state.saveState == true?'on': '')} ref='toggle' {...tapOrClick(this.doToggle.bind(this))}>
          <div className={'sound-button '+(this.state.saveState == true?'on': '')} ref='button'></div></span>
      </div>
      <div className='sound-input-div' ref='soundInput'>
        <span className={'sound-file-name '+(this.state.saveState == true?'': 'blur')} ref='inputLabel'>{languages.getTranslation('fileName')}</span>
        <div className={'sound-file-input '+(this.state.saveState == true?'': 'blur')} ref='inputBox' {...tapOrClick(this.editText.bind(this))}>{this.state.name}</div>
        <div className='sound-management' {...tapOrClick(this.showSoundList.bind(this))} ref='listManagement'>{languages.getTranslation('record-management')}<img className='icon-right' src='img/icon-back.png'/></div>
      </div>
      <SoundList isShow={'record'} soundList={this.state.soundList} id={this.state.id} closeList={this.listClosed.bind(this)}/>
    </div>);
  }
  
  componentDidMount() {
    let self = this;
    for ( let key in this.props.configs){
      if (this.props.configs[key].hasOwnProperty('defaultValue')){
        this.props.onChange && this.props.onChange( key, this.props.configs[key].defaultValue);
      }
    }
    this._register = AppDispatcher.register((action) => {
      if (action.actionType == AppConstants.SOUND_LIST_LOAD_FINISHED) {
        if(action.nodeId == this.state.id) {
          self.setState({
            soundList: action.soundList
          });
        }
      }
    });

  }

  componentDidUpdate() {
    if(this.state.name != '') {
      this.refs.soundInput.classList.add('sound-input-div-fill');
    } else {
      this.refs.soundInput.classList.remove('sound-input-div-fill');
    }
  }

  componentWillUnmount() {
    AppDispatcher.unregister(this._register);
  }

}
export { SoundRecordManagement };