import React, { PureComponent } from 'react';
import languages from '../../../../languages';
import {Inputs, Outputs, Tools} from '../../Node.react';
import tapOrClick from 'react-tap-or-click';
import UIActions from '../../../../actions/UIActions';
import nodeStore from '../../../../stores/nodeStore';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import './ControlSlider.less';

class ControlSlider extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {
      value: 0
    };
    this.debounceTimer = '';
  }

  EditName(){
    UIActions.editName(this.props.id, nodeStore.getCurrentConfig(this.props.id, 'name'));
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} id={this.props.nodeId} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src="img/icon-controlSlider.png" />
        <span className="node-preview-name">{languages.getTranslation('control-slider')}</span>
      </div>
    );
  }

  getValue(value){
    clearTimeout(this.debounceTimer);
    this.setState({
      value: parseInt(value)
    });
    this.debounceTimer = setTimeout(()=>{
      UIActions.configNode(this.props.id, {'state': parseInt(value)});
    }, 500);
  }

  renderActual() {
    return (
      <div className={'node-actual node-type-' + this.props.info.name} id={this.props.id} style={{
        left: this.props.left + 'px',
        top: this.props.top + 'px'
      }} data-type={this.props.info.name} data-category={this.props.info.props.category} ref='slider'>
        <div className='node-body node-draggable hide-config'>
          <span className='editer-gear' {...tapOrClick(this.EditName.bind(this))} style={{background:'url("img/icon-gear.png") center center / 20px no-repeat'}}></span>
          <span className="slider-value">{this.state.value}</span>
          <Slider onChange={this.getValue.bind(this)} value={this.state.value}/>
        </div>
        <Inputs ports={this.props.info.props.in} nodeId={this.props.id} />
        <Outputs ports={this.props.info.props.out} nodeId={this.props.id} showValue={true}/>
        <Tools nodeId={this.props.id} category={this.props.info.props.category}/>
      </div>);
  }

  render() {
    return this.props.isPreview ? this.renderPreview() : this.renderActual();
  }

  updateSliderStatus(result) {
    if (result.id === this.props.id) {
      this.setState({
        value: Number(result.value)
      });
    }
  }

  componentDidMount(){
    let self = this;
    if(this.props.id) {
      UIActions.initConfig(this.props.id);
      self.setState({
        value: nodeStore.getNodeConfigs(this.props.id).state.defaultValue
      });
      self.updateSliderStatusFunc = self.updateSliderStatus.bind(self);
      nodeStore.on('NodeOutputChange', self.updateSliderStatusFunc);
    }
  }

  componentWillUnmount(){
    nodeStore.off('NodeOutputChange', this.updateSliderStatusFunc);
  }
}

export { ControlSlider };