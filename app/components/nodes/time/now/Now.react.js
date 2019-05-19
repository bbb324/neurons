import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../Node.react';
import languages from '../../../../languages';
import nodeStore from '../../../../stores/nodeStore';
require('./Now.less');

class NowNode extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {
      hour: 0,
      minute: 0,
      second: 0
    };
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src='./img/icon-now.png' />
        <span className="node-preview-name">{languages.getTranslation('now')}</span>
      </div>
    );
  }

  renderActual() {
    return (
      <div className={'node-actual node-type-' + this.props.info.name} id={this.props.id} style={{
        left: this.props.left + 'px',
        top: this.props.top + 'px'
      }} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <div className='node-body node-draggable hide-config'>
          <div className='node-actual-body'>
            <span className="now">{this.state.hour}:{this.state.minute}:{this.state.second}</span>
          </div>
        </div>
        <Inputs ports={this.props.info.props.in} nodeId={this.props.id} />
        <Outputs ports={this.props.info.props.out} nodeId={this.props.id} showValue={true}/>
        <Tools nodeId={this.props.id} />
      </div>
    );
  }

  render() {
    return this.props.isPreview ? this.renderPreview() : this.renderActual();
  }

  nodeOutPutChange(bundle){
    if(this.props.id == bundle.id){
      switch (bundle.port) {
      case 'hour':
        this.setState({hour: bundle.value});
        break;
      case 'minute':
        this.setState({minute: bundle.value});
        break;
      case 'second':
        this.setState({second: bundle.value});
        break;   
      }       
    }
  }

  componentDidMount(){
    this.nodeOutPutChangeFunc = this.nodeOutPutChange.bind(this);
    nodeStore.on('NodeOutputChange', this.nodeOutPutChangeFunc);
  }
  componentWillUnmount(){
    nodeStore.off('NodeOutputChange', this.nodeOutPutChangeFunc);
  }
  
}

export { NowNode };
