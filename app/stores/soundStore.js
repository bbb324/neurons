import EventEmitter from 'wolfy87-eventemitter';
import engine from '../core/FlowEngine';
import UIActions from '../actions/UIActions';
class SoundStore extends EventEmitter {
  constructor() {
    super(...arguments);
    this.soundList = '';
  }

  fetchData(id) {
    let self = this;
    engine.callMethod(id, 'reportRecordList', (id, list)=>{
      self.soundList = list;
      self.trigger('SoundListLoadFinished', [self.soundList]);
      self.trigger('listChange', [list]);
    });
    let conf = {'getRecordList': true};
    engine.configNode(id, conf);
  }

  getSoundList() {
    return this.soundList;
  }

  soundChange(soundName) {
    this.trigger('soundChanged', [soundName]);
  }

  requestSoundList(id, type) {
    let self = this;
    engine.callMethod(id, 'reportRecordList', (id, list)=>{
      self.soundList = list;
      self.trigger('SoundListLoadFinished', [self.soundList, type]);
      self.trigger('listChange', [list]);
    });
    let conf = {'getRecordList': true};
    UIActions.configNode(id, conf);
  }

  deleteSound(id, option) {
    let conf = {'deleteRecord': this.soundList[option]};
    UIActions.configNode(id, conf);
    this.requestSoundList(id, 'show');
  }
}

let _instance = new SoundStore();

export default _instance;