import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../Node.react';
import languages from '../../../../languages';
import tapOrClick from 'react-tap-or-click';
import UIActions from '../../../../actions/UIActions';
import nodeStore from '../../../../stores/nodeStore';
require('./ControlTextInput.less');

class ControlTextInputNode extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {
      value: ''
    };
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} id={this.props.nodeId} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src="img/icon-controlTextInput.png" />
        <span className="node-preview-name">{languages.getTranslation('control-text-input')}</span>
      </div>
    );
  }

  editName(){
    //e.stopPropagation();
    UIActions.editName(this.props.id, nodeStore.getCurrentConfig(this.props.id, 'name'));
  }

  editText(e){
    UIActions.setTextInput(this.props.id, e.currentTarget.textContent);
  }

  renderActual() {
    return (
      <div className={'node-actual node-type-' + this.props.info.name} id={this.props.id} style={{
        left: this.props.left + 'px',
        top: this.props.top + 'px'
      }} data-type={this.props.info.name} data-category={this.props.info.props.category} ref='textInput'>
        <div className='node-body node-draggable ' >
          <span className='editer-gear hide-config' {...tapOrClick(this.editName.bind(this))} style={{background:'url("img/icon-gear.png") center center / 20px no-repeat'}}></span>
          <div className="node-actual-title">{languages.getTranslation('control-text-input')}</div>
          <div className="node-actual-content">
            <div className="preserve-default">{this.state.value}</div>
          </div>
        </div>
        <Inputs ports={this.props.info.props.in} nodeId={this.props.id} />
        <Outputs ports={this.props.info.props.out} nodeId={this.props.id} />
        <Tools nodeId={this.props.id} category={this.props.info.props.category}/>
      </div>
    );
  }

  render() {
    return this.props.isPreview ? this.renderPreview() : this.renderActual();
  }

  updateText(result) {
    if (result.id === this.props.id) {
      this.setState({
        value: result.value
      });
    }
  }

  componentDidMount(){
    let self = this;
    if(nodeStore.getNodeConfigs(this.props.id)) {
      self.setState({
        value: nodeStore.getNodeConfigs(this.props.id).text.defaultValue
      });

      UIActions.initConfig(this.props.id);
    }
    self.updateTextFunc = self.updateText.bind(self);
    nodeStore.on('NodeOutputChange', self.updateTextFunc);
  }

  componentWillUnmount(){
    nodeStore.off('NodeOutputChange', this.updateTextFunc);
  }   

}

export { ControlTextInputNode };
