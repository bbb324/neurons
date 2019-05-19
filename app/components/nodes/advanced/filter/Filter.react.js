import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../Node.react';
import languages from '../../../../languages';
import nodeStore from '../../../../stores/nodeStore';
import UIActions from '../../../../actions/UIActions';
import AppDispatcher from '../../../../dispatcher/AppDispatcher';
import AppConstants from '../../../../constants/AppConstants';
import './Filter.less';

class FilterNode extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {
      number: 0,
      from: this.props.info.props.configs.from.defaultValue,
      to: this.props.info.props.configs.to.defaultValue,
    };   
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <span className="node-preview-icon">{languages.getTranslation('filter')}</span>
        <span className="node-preview-name">{languages.getTranslation('filter')}</span>
      </div>
    );
  }

  onConfigChange(conf) {
    let newState = {};
    if(conf.hasOwnProperty('from')) {
      if(conf.from >= 1000) {
        newState.from = '999+';
      }else if(conf.from <= -1000) {
        newState.from = '-999+';
      } else {
        newState.from = conf.from;
      }
    }
    if(conf.hasOwnProperty('to')) {
      if(conf.to >= 1000 ) {
        newState.to = '999+';
      }else if(conf.to <= -1000) {
        newState.to = '-999+';
      }
      else {
        newState.to = conf.to;
      }
    }
    this.setState(newState); 
  } 

  renderActual() {
    return (
      <div className={'node-actual node-type-' + this.props.info.name} id={this.props.id} style={{
        left: this.props.left + 'px',
        top: this.props.top + 'px'
      }} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <div className='node-body node-draggable'>
           <div className='node-actual-body'>
            <span className="to">{this.state.to}</span>
            <img className="arrow" src='./img/filter-arrow.png' />
            <span className="from">{this.state.from}</span>
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
      this.setState({
        number: bundle.value
      });
    }
  }

  componentDidMount(){
    if(this.props.id) {
      let configs = nodeStore.getNodeConfigs(this.props.id);
      this.setState({
        from: configs.from.defaultValue,
        to: configs.to.defaultValue,
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
    this.nodeOutPutChangeFunc = this.nodeOutPutChange.bind(this);
    nodeStore.on('NodeOutputChange', this.nodeOutPutChangeFunc);
  }
  componentWillUnmount(){
    if(this.props.id) {
      AppDispatcher.unregister(this._register);
    }
    nodeStore.off('NodeOutputChange', this.nodeOutPutChangeFunc);
  }
  
}

export { FilterNode };
