import React, { Component } from 'react';
import {Inputs, Outputs, Tools} from '../../../Node.react';
import languages from '../../../../../languages';
import { Ledimage, EXAMPLE_IMAGES} from '../../../../dialogs/ImageDialog.react';
import nodeStore from '../../../../../stores/nodeStore';
import UIActions from '../../../../../actions/UIActions';
import AppDispatcher from '../../../../../dispatcher/AppDispatcher';
import AppConstants from '../../../../../constants/AppConstants';
import './Image.less';

class ImageNode extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      id: this.props.id,
      image: []
    };   
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} id={this.props.nodeId} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src="img/icon-image.png" />
        <span className="node-preview-name">{languages.getTranslation('assistance-node-image')}</span>
      </div>
    );
  }

  onConfigChange(action) {
    if(action.nodeId != this.props.id) return;
    if(action.conf.hasOwnProperty('image')) {
      this.setState({
        image: action.conf.image.matrix[0]
      });
    }
  }
  
  renderActual() {
    return (
      <div className={'node-actual node-type-' + this.props.info.name} id={this.props.id} style={{
        left: this.props.left + 'px',
        top: this.props.top + 'px'
      }} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <div className='node-body node-draggable'>
          <Ledimage readonly  width={52} image={this.state.image}/>
        </div>
        <Inputs ports={this.props.info.props.in} nodeId={this.props.id} />
        <Outputs ports={this.props.info.props.out} nodeId={this.props.id} />
        <Tools nodeId={this.props.id} />
      </div>
    );
  }

  render() {
    return this.props.isPreview ? this.renderPreview() : this.renderActual();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if(nextState !== this.state) {
      return true;
    }
    return false;
  }

  onConfig(){
    let selected = nodeStore.getNodeConfigs(this.props.id).selected.defaultValue || Number(nodeStore.getNodeConfigs(this.props.id).selected.defaultValue);
    let conf = (selected === 4 ? {matrix:nodeStore.getNodeConfigs(this.props.id).editImage.defaultValue, selected: 4} : {matrix: [EXAMPLE_IMAGES[selected]], selected: selected});
    this.setState({
      image: selected === 4 ? nodeStore.getNodeConfigs(this.props.id).editImage.defaultValue[0] : EXAMPLE_IMAGES[selected]
    });
    //matrix'value is defined by UI
    UIActions.configNode(this.props.id, {image: conf}, true);

    UIActions.initConfig(this.props.id);
  }

  componentDidMount() {
    let self = this;
    if(this.props.id) {
      this.onConfig();
      self._register = AppDispatcher.register((action) => {
        if (action.actionType == AppConstants.EDITER_NODE_CONFIG) {
          self.onConfigChange(action);
        }
      });
    }

  }

  componentWillUnmount() {
    if(this.props.id) {
      AppDispatcher.unregister(this._register);
    }
  }
  
}

export { ImageNode };