/**
 * Created by junxie on 2016/12/12.
 */

import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../../Node.react';
import languages from '../../../../../languages';
import UIActions from '../../../../../actions/UIActions';
import nodeStore from '../../../../../stores/nodeStore';
import AppDispatcher from '../../../../../dispatcher/AppDispatcher';
import AppConstants from '../../../../../constants/AppConstants';
require('./Face.less');

class FaceNode extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {
      faceId: this.props.info.props.configs.faceId.defaultValue
    }; 
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} id={this.props.nodeId} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src="img/icon-face.png" />
        <span className="node-preview-name">{languages.getTranslation('face')}</span>
      </div>
    );
  }

  onConfigChange(conf) {
    if (conf.hasOwnProperty('faceId')){
      this.setState({
        faceId: conf.faceId
      });
    }
  }

  renderFaceIcon(){
    let icon;
    switch (this.state.faceId) {
    case 'angry':
      icon =  (<div className='face-icon' style={{backgroundImage: 'url("img/face/face-angry-active.png")'}}></div> );
      break;
    case 'drowsy':
      icon =  (<div className='face-icon' style={{backgroundImage: 'url("img/face/face-drowsy-active.png")'}}></div> );
      break;
    case 'enlarged':
      icon =  (<div className='face-icon' style={{backgroundImage: 'url("img/face/face-enlarged-active.png")'}}></div> );
      break;
    case 'fixed':
      icon =  (<div className='face-icon' style={{backgroundImage: 'url("img/face/face-fixed-active.png")'}}></div> );
      break;
    case 'happy':
      icon =  (<div className='face-icon' style={{backgroundImage: 'url("img/face/face-happy-active.png")'}}></div> );
      break;
    case 'mini':
      icon =  (<div className='face-icon' style={{backgroundImage: 'url("img/face/face-mini-active.png")'}}></div> );
      break;     
    case 'normal':
      icon =  (<div className='face-icon' style={{backgroundImage: 'url("img/face/face-normal-active.png")'}}></div> );
      break;
    case 'sad':
      icon =  (<div className='face-icon' style={{backgroundImage: 'url("img/face/face-sad-active.png")'}}></div> );
      break;    
    }
    return icon;
  }  
  
  renderActual() {
    return (
      <div className={'node-actual node-type-' + this.props.info.name} id={this.props.id} style={{
        left: this.props.left + 'px',
        top: this.props.top + 'px'
      }} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <div className='node-body node-draggable' >
          {this.renderFaceIcon()}  
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

  componentDidMount() {
    if(this.props.id) {
      this.setState({
        faceId:nodeStore.getNodeConfigs(this.props.id).faceId.defaultValue
      });
      UIActions.initConfig(this.props.id);
      this._register = AppDispatcher.register((action) => {
        if (action.actionType === AppConstants.EDITER_NODE_CONFIG) {
          if(action.nodeId === this.props.id) {
            this.onConfigChange(action.conf);
          }
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

export { FaceNode };