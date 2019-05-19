import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../Node.react';
import languages from '../../../../languages';
import UIActions from '../../../../actions/UIActions';
import nodeStore from '../../../../stores/nodeStore';
import tapOrClick from 'react-tap-or-click';
import MusicBoardStore from '../../../../stores/MusicBoardStore';
import './MusicNote.less';

class MusicNoteNode extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {
      tune: this.props.info.props.configs.tune.defaultValue,
      length: this.props.info.props.configs.length.defaultValue,
      id: ''
    };

    this.meterValueChange = this.meterValueChange.bind(this);
    this.keyValueChange = this.keyValueChange.bind(this);
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src='./img/icon-musicNote.png' />
        <span className="node-preview-name">{languages.getTranslation('music-note')}</span>
      </div>
    );
  }

  onConfigChange(conf) {
    let newState = {};
    if(conf.hasOwnProperty('tune')) {
      newState.tune = conf.tune;
    }
    if(conf.hasOwnProperty('length')) {
      newState.length = conf.length;
    }
    this.setState(newState);

  }

  showBoardKey() {
    let boardValue = this.state.tune;
    let meterValue = this.state.length;
    UIActions.showMusicBoard({
      boardValue,
      meterValue,
      nodeId: this.props.id
    });
  }

  renderActual() {
    return (
      <div className={'node-actual node-type-' + this.props.info.name} id={this.props.id} style={{
        left: this.props.left + 'px',
        top: this.props.top + 'px'
      }} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <div className='node-body node-draggable hide-config'>
          <div className="node-actual-body" {...tapOrClick(this.showBoardKey.bind(this))}>
            <span className="tune">{this.state.tune}</span>
            <span>{this.state.length}</span>
          </div>
        </div>
        <Inputs ports={this.props.info.props.in} nodeId={this.props.id}/>
        <Outputs ports={this.props.info.props.out} nodeId={this.props.id}/>
        <Tools nodeId={this.props.id}/>
      </div>
    );
  }

  render() {
    return this.props.isPreview ? this.renderPreview() : this.renderActual();
  }

  setLengthValue(length) {
    let value = '';
    switch (length) {
    case '1':
      value = '1';
      break;
    case '2':
      value = '1/2';
      break;
    case '4':
      value = '1/4';
      break;
    case '8':
      value = '1/8';
      break;
    default:
      value = '1/4';
      break;
    }

    return value;
  }

  setTuneValue(tune) {
    let value ='';
    const boardBlackKeys = ['F3#', 'G3#', 'A3#', 'C4#', 'D4#', 'F4#', 'G4#', 'A4#', 'C5#', 'D5#'];
    const endBlackKeys = ['f3m', 'g3m', 'a3m', 'c4m', 'd4m', 'f4m', 'g4m', 'a4m', 'c5m', 'd5m'];
    if(tune.indexOf('m') >= 0) {
      value = boardBlackKeys[endBlackKeys.indexOf(tune)];
    }else {
      value = tune.toUpperCase();
    }
    return value;
  }

  meterValueChange() {
    if(MusicBoardStore.nodeId === this.state.id) {
      this.setState({
        length: MusicBoardStore.meterValue
      });
    }
  }

  keyValueChange() {
    if(MusicBoardStore.nodeId === this.state.id) {
      this.setState({
        tune: MusicBoardStore.boardValue
      });
    }
  }

  componentDidMount() {
    if(this.props.id) {
      let configs = nodeStore.getNodeConfigs(this.props.id);
      let length = configs.tune.defaultValue, tune = configs.tune.defaultValue;
      this.setState({
        tune: this.setTuneValue(tune),
        length: this.setLengthValue(length),
        id: this.props.id
      });
      UIActions.initConfig(this.props.id, false);
    }
    MusicBoardStore.addMeterChange(this.meterValueChange);
    MusicBoardStore.addKeyValueChange(this.keyValueChange);
  }

  componentWillUnmount() {
    MusicBoardStore.removeMeterChange(this.meterValueChange);
    MusicBoardStore.removeKeyValueChange(this.keyValueChange);
  }

}

export { MusicNoteNode };