/**
 * Created by junxie on 2016/12/12.
 */

import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../Node.react';
import languages from '../../../../languages';
import tapOrClick from 'react-tap-or-click';
import UIActions from '../../../../actions/UIActions';
import nodeStore from '../../../../stores/nodeStore';

require('./ControlIndicator.less');

class ControlIndicatorNode extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {
      value: false
    };
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} id={this.props.nodeId} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src="img/icon-controlIndicator.png" />
        <span className="node-preview-name">{languages.getTranslation('control-indicator')}</span>
      </div>
    );
  }

  updateInput(bundle) {
    if(bundle.id === this.props.id){
      let value = bundle.value;
      if(isNaN(Number(value))) {
        value = true;
      } else {
        value = Number(bundle.value) > 0;
      }

      this.setState({
        value: value,
      });
    }
  }

  EditName(){
    UIActions.editName(this.props.id, nodeStore.getCurrentConfig(this.props.id, 'name'));
  }

  renderActual() {
    return (
      <div className={'node-actual node-type-' + this.props.info.name} id={this.props.id} style={{
        left: this.props.left + 'px',
        top: this.props.top + 'px'
      }} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <div className='node-body node-draggable hide-config' >
          <span className='editer-gear' {...tapOrClick(this.EditName.bind(this))} style={{background:'url("img/icon-gear.png") center center / 20px no-repeat'}}></span>
          <div className='node-actual-shadow'>
            <div className={'node-actual-icon ' + (this.state.value?'active': '')} ></div>
          </div>
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

  componentDidMount() {
    let self = this;
    self.updateInputFunc = self.updateInput.bind(self);
    nodeStore.on('NodeInputChange', self.updateInputFunc);
    self.setState({
      value: nodeStore.getNodeInputValue(self.props.id, 'input')
    });
  }

  componentWillUnmount() {
    nodeStore.off('NodeInputChange', this.updateInputFunc);
  }   

}

export { ControlIndicatorNode };
