/**
 * Created by junxie on 17/4/26.
 */
import EventEmitter from 'wolfy87-eventemitter';
import RestfulApiImpl from '../utils/RestfulApiImpl';
const OPENDIALOG = 'openUpdateDialog';
import base64 from 'base64-js';
import engine from '../core/FlowEngine';
import wifiStore from './wifiStore';
const TIMEOUT = 5000;
const BYTES_PER_CHUNK = 4096;
const UPDATEPROGRESSBAR = 'UpdateProgressBar';
const UPLOADFINISHED = 'UploadFinished';
const UPDATEERROR = 'UpdateError';
const UPDATEFILE = './updates/neurons-server';
class wifiServerStore extends EventEmitter{

  constructor() {
    super(...arguments);
    this._start = 0;
    this._counter = 1;  // record current uploading piece
    this._serverRestartSuc = false;
    this._forceToStop = false;
    wifiStore.on('wifiModuleStatusChange', this.handleWifiChange.bind(this));
    wifiStore.on('wifiConnected', this.handleWifiConnected.bind(this));

    this.updateResult = 'undo';
    this.resetWifiStatus = false;
  }

  showUpdateDialog() {
    this.trigger(OPENDIALOG);
  }

  /* update wifi server in this function,
      1. ask server if ready to update, if return true execute next step
      2. read RSA sign file
      3. read update file
      4. separate update file into pieces, each size is limited to 1024b
      5. for each piece do RSA-SHA256 check
      6. transcript each piece to base64 code, and then upload with SignResult
      7. if upload pass server RSA check, upload next piece, else upload current again
    */
  doUpdate() {
    let self = this;
    new Promise(self.requestUpdate.bind(self)).then((result)=>{
      if(result.readytoReceive == true) {
        return new Promise(self.getRSASigner.bind(self));
      } else {
        self.handleUpdateError();
      }
    }).then((result)=>{
      self.MD5Key =  result;
      return new Promise(self.getUpdateFile.bind(self));
    }).then((result) => {
      self.BinaryData = result;
      self.updateWifiServer();
    });
  }

  getUpdateFile(resolve) {
    let fileUrl = UPDATEFILE;
    let xhr = new XMLHttpRequest();
    xhr.open('GET', fileUrl, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
      var arrayBuffer = xhr.response;
      if (arrayBuffer) {
        resolve(new Uint8Array(arrayBuffer));
      }
    };
    xhr.send(null);
  }

  getRSASigner(resolve) {
    let fileUrl = './updates/prikey';
    let xhr = new XMLHttpRequest();
    xhr.open('GET', fileUrl, true);
    xhr.onload = function () {
      resolve(xhr.responseText);
    };
    xhr.send(null);
  }

  requestUpdate(resolve, reject) {
    let self = this;
    let getUrl = 'http://' + engine.getWifiServerIp() + ':8083/updateServer';
    let callback = function(status, responseText) {
      if(responseText == 'timeout' || status == 0) {
        self.handleUpdateError();
      }
      if(status == 200) {
        let response = JSON.parse(responseText);
        if(response.errCode == 0) {
          resolve(response);
        }
      } else {
        reject(responseText);
      }
    };
    try {
      RestfulApiImpl.doPost(getUrl, JSON.stringify(''), callback, TIMEOUT, 'upload-request');
    } catch(e) {
      self.handleUpdateError();
    }
  }

  updateWifiServer() {
    let self = this;
    if (self._start < self.BinaryData.length && self._forceToStop == false) {
      let end = self._start + BYTES_PER_CHUNK;
      let piece = self.BinaryData.subarray(self._start, end); // piece of BinaryData, each length as 2048
      self.SignResult = engine.createSign('RSA-SHA256', self.MD5Key, piece);
      let base64Data = base64.fromByteArray(piece);
      let postData = {'filedata': base64Data, sign: self.SignResult};
      let getUrl = 'http://' + engine.getWifiServerIp() + ':8083/updateServer';
      let totalPackage = Math.ceil(self.BinaryData.length/BYTES_PER_CHUNK);
      let callback = function (status, responseText) {
        if(responseText == 'timeout') {
          self.handleUpdateError();
        } else {
          let response = JSON.parse(responseText);
          if (status == 200) {
            if (response.errCode == 0 && response.readytoReceive == true) {
              self.updateResult = 'updating';
              self._start = end;
              self._counter++;
              if(base64Data.length>=BYTES_PER_CHUNK) {
                self.trigger(UPDATEPROGRESSBAR, [parseInt((self._counter)/totalPackage*100)]);
              }
              self.updateWifiServer();
            } else {
              self.handleUpdateError();
            }
          } else {
            self.handleUpdateError();
          }
        }
      };
      try {
        if(self.updateResult == 'updating' || self.updateResult == 'undo') {
          RestfulApiImpl.doPost(getUrl, JSON.stringify(postData), callback, TIMEOUT, 'filedata');
        } else {
          self.handleUpdateError();
        }
      } catch(e) {
        self.handleUpdateError();
      }
    } else if(self._forceToStop == true) {
      self.handleUpdateError();
    } else {
      self.updateWifiServerFinished();
    }
  }

  getWifiAddr() {
    return engine.getWifiServerIp();
  }

  setUpdateStatus() {
    this.updateResult = 'undo';
    this._forceToStop = false;
    this._start = 0;
    this._counter = 1;
  }

  getUpdateStatus() {
    return this.updateResult;
  }

  updateWifiServerFinished() {
    let self = this;
    let getUrl = 'http://' + engine.getWifiServerIp() + ':8083/updateServer';
    let postData = {command: 'upload-end'};
    let callback = function (status, responseText) {
      if(responseText == 'timeout') {
        self.handleUpdateError();
      } else if (status == 200) {
        let response = JSON.parse(responseText);
        if (response.errCode == 0) {
          self.updateResult = 'success';
          self.trigger(UPLOADFINISHED);
        }
      } else {
        self.handleUpdateError();
      }
    };
    try {
      RestfulApiImpl.doPost(getUrl, JSON.stringify(postData), callback, 15000, 'upload-end');
    } catch(e) {
      self.handleUpdateError();
    }
  }

  handleUpdateError() {
    let self = this;
    self._counter = 1;
    self._start = 0;
    self.updateResult = 'undo';
    self._serverRestartSuc = false;
    self.trigger(UPDATEERROR);
  }

  forcetoStopUpdate() {
    this._forceToStop = true;
    this.handleUpdateError();
  }
  clearForceToStopUpdate() {
    this._forceToStop = false;
  }

  reconnectWifi() {
    let self = this;
    self._serverRestartSuc = false;
    wifiStore.searchWifiModule();
  }

  handleWifiChange() {
    if(this.updateResult == 'success') {
      let self = this;
      let wifiIp = engine.getWifiServerIp();
      let wifiList = wifiStore.getSearchWifiModuleStatus();
      for(let i = 0; i < wifiList.length; ++i) {
        if(wifiIp == wifiList[i].ip) {
          self._serverRestartSuc = true;
          wifiStore.stopSearchWifiModule();
          break;
        }
      }
      if(self._serverRestartSuc && this.resetWifiStatus == false) {
        this.resetWifiStatus = true;
        engine.setConfig({serverIP: wifiIp});
        engine.setDriver('cordovatcp');
      }
    }
  }

  handleWifiConnected() {
    this.resetWifiStatus = false;
  }
}

let _instance = new wifiServerStore();

export default _instance;