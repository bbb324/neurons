/**
 * Created by KongyunWu on 2017/3/30.
 */
import React, { Component } from 'react';
import tapOrClick from 'react-tap-or-click';
import UIActions from '../../actions/UIActions';
import MusicBoardStore from '../../stores/MusicBoardStore';
//import AppDispatcher from '../../dispatcher/AppDispatcher';
//import AppConstants from '../../constants/AppConstants';
import languages from '../../languages';
//import { TouchHandler } from '../editer/TouchHandler';
//import engine from '../../core/FlowEngine';
const boardBlackKeys = ['F3#', 'G3#', 'A3#', 'C4#', 'D4#', 'F4#', 'G4#', 'A4#', 'C5#', 'D5#'];
const endBlackKeys = ['f3m', 'g3m', 'a3m', 'c4m', 'd4m', 'f4m', 'g4m', 'a4m', 'c5m', 'd5m'];

class PlayMusic extends Component {
  constructor() {
    super(...arguments);
    this.meterValue = '';
    switch (this.props.configs.length.defaultValue) {
    case '1':
      this.meterValue = '1';
      break;
    case '2':
      this.meterValue = '1/2';
      break;
    case '4':
      this.meterValue = '1/4';
      break;
    case '8':
      this.meterValue = '1/8';
      break;
    default:
      break;
    }

    let endBoardValue = this.props.configs.tune.defaultValue;
    if(endBoardValue.indexOf('m') >= 0) {
      this.boardValue = boardBlackKeys[endBlackKeys.indexOf(endBoardValue)];
    }else {
      this.boardValue = endBoardValue.toUpperCase();
    }

    this.state = {
      boardValue: this.boardValue,
      meterValue: this.meterValue,
      id: this.props.id
    };

    this.showBoardKey = this.showBoardKey.bind(this);
    this.meterValueChange = this.meterValueChange.bind(this);
    this.keyValueChange = this.keyValueChange.bind(this);
  }

  showBoardKey() {
    let boardValue = this.state.boardValue;
    let meterValue = this.state.meterValue;
    UIActions.showMusicBoard({
      boardValue,
      meterValue,
      nodeId: this.props.id
    });
  }

  meterValueChange() {
    if(MusicBoardStore.nodeId === this.state.id) {
      this.setState({
        meterValue: MusicBoardStore.meterValue
      });
    }
  }

  keyValueChange() {
    if(MusicBoardStore.nodeId === this.state.id) {
      this.setState({
        boardValue: MusicBoardStore.boardValue
      });
    }
  }

  render(){
    return (<div>
      <span className='music-title'>{languages.getTranslation('music-note')}</span>
      <div className='music-input-div' ref='musicInput' {...tapOrClick(this.showBoardKey.bind(this))}>
        <span className="board-value">{this.state.boardValue}</span>
        <span className="meter-value">{this.state.meterValue}</span>
      </div>
    </div>);
  }

  componentDidMount() {
    let play = false;
    for ( let key in this.props.configs){
      if (this.props.configs[key].hasOwnProperty('defaultValue')){
        this.props.onChange && this.props.onChange( key, this.props.configs[key].defaultValue,play);
      }
    }

    MusicBoardStore.addMeterChange(this.meterValueChange);
    MusicBoardStore.addKeyValueChange(this.keyValueChange);
  }

  componentWillUnmount() {
    MusicBoardStore.removeMeterChange(this.meterValueChange);
    MusicBoardStore.removeKeyValueChange(this.keyValueChange);
  }
}
export { PlayMusic };