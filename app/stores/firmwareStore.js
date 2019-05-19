import EventEmitter from 'wolfy87-eventemitter';
import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants from '../constants/AppConstants';
import engine from '../core/FlowEngine';

let _instance = null;

const EVENT_UPDATE_BLOCK_RESULT = 'updateBlockFirmwareResult';
const EVENT_INITIATIVE_DISCONNECT = 'nodeInitiativeDisconnect';
const EVENT_DISCONNECT_RECONNECT = 'NodeDisconnectReconnect';

class FirmwareStore extends EventEmitter {
  constructor() {
    super();
    let self = this;
    self.firmwaremap = [];
    self._updateResult = 0; // 1 means update success, 0 means fail
    engine.on('NodeUpdateResult', self.updateBlockFirmwareResult.bind(self));
    engine.on('NodeInitiativeDisconnect', self.nodeInitiativeDisconnect.bind(self));
    engine.on('NodeDisconnReconnect', self.NodeDisconnectReconnect.bind(self));
    self.getFirmwareMap();
  }

  NodeDisconnectReconnect() {
    console.log('NodeDisconnectReconnect');
    this.trigger(EVENT_DISCONNECT_RECONNECT);
  }


  nodeInitiativeDisconnect() {
    console.log('NodeInitiativeDisconnect');
    let self = this;
    self.trigger(EVENT_INITIATIVE_DISCONNECT);
  }

  getUpdateBlockFirmwareResult() {
    return this._updateResult;
  }

  updateBlockFirmwareResult(updateRet) {
    let self = this;
    console.log('[updateBlockFirmwareResult] updateRet:', updateRet);
    self._updateResult = updateRet.result;
    self.trigger(EVENT_UPDATE_BLOCK_RESULT);
  }

  hexBuf(value) {
    var byte = '';
    byte = value.toString(16);
    if (byte.length < 2) {
      byte = '0' + byte;
    }
    return byte;
  }

  getFirmwareMap() {
    let self = this;
    let firmwareUrl = './firmware/firmwaremap.json';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', firmwareUrl, true);
    xhr.onload = function () {
      let map = JSON.parse(xhr.response);
      for(let key in map) {
        self.firmwaremap[key] = map[key];
      }

      // for(let key in self.firmwaremap) {
      //   console.log(key, self.firmwaremap[key]);
      // }
    };
    xhr.send(null);
  }

  setFirmwareByTypeAndSubtype(type, subtype) {
    let self = this;
    let callback = function(uint8buf) {
      console.log('[setFirmwareByTypeAndSubtype] callback ', type, subtype);
      engine.setNeuronFirmware(type, subtype, uint8buf);
    };
    self.getRelativeFirmware(type, subtype, callback);
  }

  getRelativeFirmware(type, subtype, callback) {
    let self = this;
    console.log('type:', self.hexBuf(type), ' subtype:', self.hexBuf(subtype));
    let fwkey = '_' + self.hexBuf(type) + '_' + self.hexBuf(subtype) + '_';
    let fwvalue = self.firmwaremap[fwkey];
    console.log(typeof fwvalue, fwvalue);
    if(fwvalue == null || fwvalue == undefined) {
      console.log('fwvalue == null || fwvalue == undefined');
      return;
    }
    let firmwareUrl = './firmware/code/' + fwvalue;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', firmwareUrl, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
      var arrayBuffer = xhr.response;    // 注意:不是oReq.responseText
      if (arrayBuffer) {
        var uint8buf = new Uint8Array(arrayBuffer);
        console.log('uint8buf.length:', uint8buf.length);
        callback(uint8buf);
      }
    };
    xhr.send(null);
  }

  updateBlockISP(id) {
    console.log('[updateBlockISP] nodeId:', id);
    let self = this;
    let typeObj = engine.getTypeAndSubtypeById(id);
    if(typeObj.type == -1 || typeObj.subtype == -1) {
      console.log('[updateBlockISP] unexpected type:', typeObj.type);
      return;
    }
    let callback = function(uint8buf) {
      console.log('[updateBlockISP] callback ', id, typeObj.type, typeObj.subtype);
      engine.updateBlockISP(id, typeObj.type, typeObj.subtype, uint8buf);
    };
    self.getRelativeFirmware(typeObj.type, typeObj.subtype, callback);
  }
}

_instance = new FirmwareStore();

AppDispatcher.register((action) => {
  if(action.actionType == AppConstants.UPDATE_BLOCK_ISP) {
    _instance.updateBlockISP(action.id);
  }

});


export default _instance;