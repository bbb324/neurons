import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../../Node.react';
//import { LedSet } from '../../../../dialogs/configurator/Pattern.react';
import languages from '../../../../../languages';
import nodeStore from '../../../../../stores/nodeStore';
import UIActions from '../../../../../actions/UIActions';
import AppDispatcher from '../../../../../dispatcher/AppDispatcher';
import AppConstants from '../../../../../constants/AppConstants';

import './Pattern.less';

const COLOR_LIST = ['#9DB0CE', '#FF0000', '#FFAF00', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#D400FF', '#FFFFFF'];
const EXAMPLE_IMAGES = [
  //
  {
    mode: 'static',
    colors: [1,2,3,4,5,6,7]
  },
  //
  {
    mode: 'roll',
    colors: [1,2,3,2,1]
  },
  //
  {
    mode: 'repeat',
    colors: [5,7,8,7,5]
  },
  //
  {
    mode: 'marquee',
    colors: [4,3,8,3,4]
  },
];

class LedSet extends PureComponent {
  constructor() {
    super();
  }
  renderCells(colors) {
    if(colors){
      let data = colors;
      let tmp = data.map(function (value, key) {
        if (key <= 7) {
          return (
            <li className={'ledList '+(key==7?' mid': '')} key={key} data-color={value}
                style={{backgroundColor: COLOR_LIST[value]}}>
            </li>
          );
        } else {
          return (
            <li className={'lower ledList'} key={key} data-color={value}
                style={{backgroundColor: COLOR_LIST[value]}}>
            </li>
          );
        }
      });
      return tmp;
    }
  }
  render() {
    let colors = this.props.colors;
    return (
      <ul className='ledListPreview'>
        {this.renderCells(colors)}
      </ul>
    );
  }
}

class PatternNode extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {
      id: this.props.id,
      pattern: {}
    };   
  }

  getDefaultSelected(){
    let configs = nodeStore.getNodeConfigs(this.props.id);
    return configs.selected.defaultValue;
  } 

  getEditPattern(){
    let configs = nodeStore.getNodeConfigs(this.props.id);
    return configs.editPattern.defaultValue;
  } 

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} id={this.props.nodeId} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src="img/LedStrip/icon-pattern-preview.png" />
        <span className="node-preview-name">{languages.getTranslation('pattern')}</span>
      </div>
    );
  }

  onConfigChange(action) {
    if(action.nodeId !== this.props.id) {return;}
    if(action.conf.hasOwnProperty('pattern')) {
      this.setState({
        pattern: action.conf.pattern.pattern
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
          <div className='display-pattern'>
            <LedSet colors={this.state.pattern.colors}/>
          </div>
        </div>
        <Inputs ports={this.props.info.props.in} nodeId={this.props.id} />
        <Outputs ports={this.props.info.props.out} nodeId={this.props.id} />
         <Tools nodeId={this.props.id} />
      </div>
    );
  }

  onConfig(){
    let selected = nodeStore.getNodeConfigs(this.props.id).selected.defaultValue;
    let conf = (selected === 4 ? {pattern: nodeStore.getNodeConfigs(this.props.id).editPattern.defaultValue, selected: 4} : {pattern: EXAMPLE_IMAGES[selected], selected: selected});
    this.setState({
      pattern: selected === 4 ? nodeStore.getNodeConfigs(this.props.id).editPattern.defaultValue : EXAMPLE_IMAGES[selected]
    });
    //pattern'value is defined by UI
    UIActions.configNode(this.props.id, {pattern: conf}, true);

    UIActions.initConfig(this.props.id);
  }

  render() {
    return this.props.isPreview ? this.renderPreview() : this.renderActual();
  }

  componentDidMount() {
    let self = this;
    if(self.props.id) {
      self.onConfig();
      self._register = AppDispatcher.register((action) => {
        if (action.actionType === AppConstants.EDITER_NODE_CONFIG) {
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

export { COLOR_LIST, EXAMPLE_IMAGES, LedSet, PatternNode };