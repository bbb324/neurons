import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../Node.react';
import languages from '../../../../languages';
import tapOrClick from 'react-tap-or-click';
import UIActions from '../../../../actions/UIActions';
import nodeStore from '../../../../stores/nodeStore';
require('./ControlToggle.less');

class ControlToggleNode extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {
      value: this.props.action
    };
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} id={this.props.nodeId} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src="img/icon-controlToggle.png" />
        <span className="node-preview-name">{languages.getTranslation('control-toggle')}</span>
      </div>
    );
  }

  switchTab(){
    let bool = this.state.value? false: true;
    UIActions.configNode(this.props.id, {'state': bool});
  }

  EditName(){
    UIActions.editName(this.props.id, nodeStore.getCurrentConfig(this.props.id, 'name'));
  }

  renderActual() {
    return (
      <div className={'node-actual node-type-' + this.props.info.name} id={this.props.id} style={{
        left: this.props.left + 'px',
        top: this.props.top + 'px'
      }} data-type={this.props.info.name} data-category={this.props.info.props.category} ref='toggle'>
        <div className='node-body node-draggable hide-config' >
          <div className='toggle-bg' style={{background: this.state.value==true?'#09f1ff':''}} {...tapOrClick(this.switchTab.bind(this))}>
            <span className='toggle-txt' style={{textAlign: this.state.value==true?'left':'right'}}>{this.state.value == true? 'ON': 'OFF'}</span>
            <div className={'cloud-btn '+ (this.state.value==true?'switchONOFF':'')}>
              <div className="cloud-btn-inner"></div>
            </div>
          </div>
          <span className='editer-gear' {...tapOrClick(this.EditName.bind(this))} style={{background:'url("img/icon-gear.png") center center / 20px no-repeat'}}></span>
        </div>       
        <Inputs ports={this.props.info.props.in} nodeId={this.props.id} />
        <Outputs ports={this.props.info.props.out} nodeId={this.props.id} showValue={true}/>
        <Tools nodeId={this.props.id} category={this.props.info.props.category}/>
      </div>
    );
  }

  render() {
    return this.props.isPreview ? this.renderPreview() : this.renderActual();
  }

  updateToggle(result) {
    if (result.id === this.props.id) {
      let flag = result.value;
      this.setState({
        value: flag
      });
    }
  }

  componentDidMount(){
    let self = this;
    if(this.props.id) {
      self.setState({
        value: nodeStore.getNodeConfigs(this.props.id).state.defaultValue
      });
      UIActions.initConfig(this.props.id);
    }
    self.updateToggleFunc = self.updateToggle.bind(self);
    nodeStore.on('NodeOutputChange', self.updateToggleFunc);
  }
  componentWillUnmount(){
    nodeStore.off('NodeOutputChange', this.updateToggleFunc);
  }

}

export { ControlToggleNode };