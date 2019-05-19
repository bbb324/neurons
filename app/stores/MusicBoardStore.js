import EventEmitter from 'wolfy87-eventemitter';
import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants from '../constants/AppConstants';

class MusicBoardStore extends EventEmitter {
  constructor() {
    super(...arguments);
    this.isShowBoard = '';
    this.nodeId = '';
    this.meterValue = '';
    this.boardValue = '';
    let self = this;
    AppDispatcher.register((action) => {
      switch (action.actionType) {
      case AppConstants.SHOW_MUSIC_BOARD:
        self.getIsShow(true);
        self.getNodeId(action.nodeId);
        self.getMeterValue(action.meterValue);
        self.getBoardValue(action.boardValue);
        self.trigger('showBoard');
        break;
      case AppConstants.MUSIC_METER_CHANGE:
        self.getMeterValue(action.meterValue);
        self.trigger('meterChange');
        break;
      case AppConstants.MUSIC_KEY_VALUE_CHANGE:
        self.getBoardValue(action.boardValue);
        self.trigger('keyValueChange');
        break;
      case AppConstants.GLOBAL_CANVAS_TOUCH:
      case AppConstants.MOVING_NODE:
        self.getIsShow(false);
        self.trigger('musicSyncConfigurator');
        break;
      default:
        break;
      }
    });
  }

  getIsShow(boolean) {
    this.isShowBoard = boolean;
  }

  getNodeId(id) {
    this.nodeId = id;
  }

  getMeterValue(meterValue) {
    this.meterValue = meterValue;
  }

  getBoardValue(boardValue) {
    this.boardValue = boardValue;
  }

  addShowBoard(callback) {
    this.on('showBoard', callback);
  }

  removeShowBoard(callback) {
    this.off('showBoard', callback);
  }

  addMeterChange(callback) {
    this.on('meterChange', callback);
  }
  removeMeterChange(callback) {
    this.off('meterChange', callback);
  }

  addKeyValueChange(callback) {
    this.on('keyValueChange', callback);
  }
  removeKeyValueChange(callback) {
    this.off('keyValueChange', callback);
  }

  addMusicSyncConfigurator(callback) {
    this.on('musicSyncConfigurator', callback);
  }
  removeMusicSyncConfigurator(callback) {
    this.off('musicSyncConfigurator', callback);
  }
}

let _instance = new MusicBoardStore();
export default  _instance;
