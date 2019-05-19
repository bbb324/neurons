import React, { Component } from 'react';
import AppDispatcher from '../../dispatcher/AppDispatcher';
import AppConstants from '../../constants/AppConstants';
import tapOrClick from '../../utils/tapOrClick';
import engine from '../../core/FlowEngine';
import languages from '../../languages';
import UIActions from '../../actions/UIActions';

class EditTextBox extends Component {
  constructor(){
    super(...arguments);
    this.state={
      isActive: false,
      id: null,
      originText: '',
      title: '',
      type: '',
      saveAble: false,
      onConfirm: null
    };
    this.emitter = this.props.emitter;
    this.closePanel = this.closePanel.bind(this);
  }

  closePanel(){
    this.setState({
      isActive: false
    });
    this.refs.inputBox.value = '';
    this.refs.inputBox.blur();
  }

  saveChange(){
    if(this.state.type == 'setName') {
      engine.configNode(this.state.id, {name: this.refs.inputBox.value});
      this.state.onConfirm && this.state.onConfirm(this.refs.inputBox.value);
      this.refs.inputBox.value = '';
      UIActions.updateCloudProject();
    } else if(this.state.type == 'setText') {
      engine.configNode(this.state.id, {text: this.refs.inputBox.value});
      this.state.onConfirm && this.state.onConfirm(this.refs.inputBox.value);
      UIActions.getTextInput(this.state.id, this.refs.inputBox.value);
    }
    this.setState({
      isActive: false
    });
    this.refs.inputBox.blur();
  }

  clearText(){
    this.setState({
      originText: '',
      saveAble: false
    });
  }

  render(){
    return (<div className={'edit-panel '+(this.state.isActive==true?'':'hide')}>
      <div className='panel-cover' {...tapOrClick(this.closePanel)}></div>
      <div className='edit-text' ref='editText'>
        <span className='edit-title'>{this.state.title}</span>
        <div className='input-div'><input className='edit-input'
               type='text' placeholder={languages.getTranslation('edit-text')}
               ref='inputBox'
               value={this.state.originText} required />
          <a {...tapOrClick(this.clearText.bind(this))} className='clear-input' style={{background:'url("img/icon-close.png") center / 28px no-repeat'}}></a>
        </div>
        <div className='btn-area'><span className='edit-btn' {...tapOrClick(this.saveChange.bind(this))}>{languages.getTranslation('save')}</span></div>
      </div>
    </div>);
  }

  componentDidMount(){
    let self = this;
    this._register = AppDispatcher.register((action)=>{
      if(action.actionType == AppConstants.EDIT_CLOUD_NODE_NAME) {
        self.setState({
          isActive: true,
          id: action.id,
          originText: action.name || '',
          title: languages.getTranslation('setName'),
          type: 'setName',
          saveAble: action.name== ''?false:true,
          onConfirm: action.onConfirm
        });
      } else if(action.actionType == AppConstants.EDIT_TEXT_INPUT) {
        self.setState({
          isActive: true,
          id: action.id,
          title: languages.getTranslation('setText'),
          type: 'setText',
          originText: action.text || '',
          saveAble: action.text ==''? false:true,
          onConfirm: action.onConfirm
        });
      }
    });
    this.refs.inputBox.addEventListener('input', ()=>{
      if(self.refs.inputBox.value.length !=0){
        self.setState({
          saveAble: true,
          originText: self.refs.inputBox.value
        });
      } else {
        self.setState({
          saveAble: false,
          originText: ''
        });
      }
    });
    if(window._runtime == 'cordova' && /Android/.test(navigator.appVersion)) {
      window.addEventListener('native.keyboardshow', ()=> {
        if (window.scrollY < 100 && self.refs.editText) //键盘高度一般大于100，如果scrollY小于100，可以认为界面未上移，则需要手动上移
        {
          self.refs.editText.style.top = self.refs.editText.getBoundingClientRect().top+'px';
        }
      });
      window.addEventListener('native.keyboardhide', ()=>{
        if( self.refs.editText != undefined) {
          self.refs.editText.style.top = '';
        }
      });
    }
  }
  componentWillUnmount() {
    AppDispatcher.unregister(this._register);
    if(window._runtime == 'cordova' && /Android/.test(navigator.appVersion)) {
      window.removeEventListener('native.keyboardshow');
      window.removeEventListener('native.keyboardhide');
    }
  }
}

export { EditTextBox };