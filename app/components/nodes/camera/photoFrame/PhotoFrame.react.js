import React, { Component } from 'react';
import {Inputs, Outputs, Tools} from '../../Node.react';
import engine from '../../../../core/FlowEngine';
import nodeStore from '../../../../stores/nodeStore';
import tapOrClick from '../../../../utils/tapOrClick';
import UIActions from '../../../../actions/UIActions';
import languages from '../../../../languages';

require('./PhotoFrame.less');

const getPictureUrl = (file) => {
  return 'http://'+engine.getWifiServerIp()+':8083/viewPhoto?'+new Date().getTime()+'&filename=' + file;
};

class PhotoFrameNode extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      image: ''
    };
  }

  updateInput(bundle) {
    if(bundle.id === this.props.id){
      if(bundle.value && bundle.value.type == 'snapshot') {
        this.setState({
          image: bundle.value.file,
        });
      }
      
    }
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src='./img/icon-photoFrame.png' />
        <span className="node-preview-name">{languages.getTranslation('photo-frame')}</span>
      </div>
    );
  }

  viewPhoto(e) {
    UIActions.openPhotoDialog(e.target.src);
  }

  renderActual() {
    return (
      <div className={'node-actual node-type-' + this.props.info.name} id={this.props.id} style={{
        left: this.props.left + 'px',
        top: this.props.top + 'px'
      }} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <div className='node-body node-draggable hide-config'>
          <img ref='photoframe' src={this.state.image? getPictureUrl(this.state.image) : './img/photo-frame-empty.png'} {...tapOrClick(this.viewPhoto.bind(this))}/>
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
    if(this.refs.photoframe) {
      this.refs.photoframe.onerror = function () {
        self.refs.photoframe.src = './img/photo-frame-empty.png';
      };
    }

  }

  shouldComponentUpdate(nProps, nState) {
    if(nState !== this.state) {
      return true;
    }
    return false;
  }

  componentWillUnmount() {
    nodeStore.off('NodeInputChange', this.updateInputFunc);
    if(this.refs.photoframe) {
      this.refs.photoframe.onerror = null;
    }

  }

}

export { PhotoFrameNode };