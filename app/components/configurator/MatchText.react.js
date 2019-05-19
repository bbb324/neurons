import React, { Component } from 'react';
import tapOrClick from 'react-tap-or-click';
import languages from '../../languages';
import UIActions from '../../actions/UIActions';
import AppDispatcher from '../../dispatcher/AppDispatcher';
import AppConstants from '../../constants/AppConstants';
require('./Configurator.less');

class MatchText extends Component {
  constructor() {
    super(...arguments);
    this.defaultConf = {};
    this.state = {
      isActive: false,
      text: this.props.configs.text.defaultValue
    };
  }

  editText(){
    UIActions.setTextInput(this.props.id, this.state.text);
  }

  render(){
    return (
      <div>
        <div className={'text-content ' + (this.state.text===''?'translucent':'')} {...tapOrClick(this.editText.bind(this))} >{this.state.text===''?languages.getTranslation('please input content'):this.state.text}</div>
     </div>
    );
  }

  componentDidMount(){
    let self = this;
    for ( let key in self.props.configs){
      if (self.props.configs[key].hasOwnProperty('defaultValue')){
        self.props.onChange && self.props.onChange( key, self.props.configs[key].defaultValue);
      }
    }    
    this._register = AppDispatcher.register((action)=>{
      if(action.actionType == AppConstants.EDITER_NODE_CONFIG) {
        if(self.refs.textInput && self.refs.textInput.id == action.nodeId) {
          self.setState({text: action.conf.text || ''});
        }
      } else if (action.actionType == AppConstants.GET_TEXT_INPUT) {
        if (action.id === self.props.id){
          self.setState({text: action.text || ''});
        }
      }
    });
  }

  componentWillUnmount(){
    AppDispatcher.unregister(this._register);
  }   

}

export { MatchText };