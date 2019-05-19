import EventEmitter from 'wolfy87-eventemitter';
import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants from '../constants/AppConstants';
import engine from '../core/FlowEngine';

const EVENT_STATUS_CHANGE = 'statusChange';
const EVENT_LIST_CHANGE = 'listChange';

const LINKTYPE_BLE = 'ble';
const LINKTYPE_WIFI = 'wifi';

const LINK_STATUS_CONNECTED = 'connected';
const LINK_STATUS_DISCONNECTED = 'disconnected';
const LINK_STATUS_CONNECTING = 'connecting';
const LINK_STATUS_FAILED = 'failed';
const LINK_STATUS_CLOSED = 'closed';
const LINK_TIMEOUT = 10000;

const FIRST_DISTANCE = 1;
const SECOND_DISTANCE = 1;
const REACH_CONNECTABLE_TIMES = 1;

class LinkStore extends EventEmitter {
  constructor() {
    super(...arguments);
    this.linkType = LINKTYPE_BLE; // ble, wifi
    this.connectedDevice = null;
    this.deviceList = [];
    this.status = 'disconnected'; // disconnected, connected, connecting, failed
    this.isBleEnabled = false;
    this.isDialogOpen = false;

    this._autoConnectTimer1 = 0;
    this._autoConnectTimer2 = 0;
    this._openScan = false;
    this._autoConnect = false;
    this._autoDeviceList = [];

    this._checkBleEnabledTimer = 0;
  }

  checkBleEnabled() {

    let self = this;
    if (window.ble) {
      ble.isEnabled(() => {
        if(!self.isBleEnabled && self.isDialogOpen) {
          console.log('Bluetooth is enabled');
          self.startScan();
          self.status = LINK_STATUS_DISCONNECTED;
          self.trigger(EVENT_STATUS_CHANGE);
        }
        // if(!self.isBleEnabled) {
        //   self._openScan = true;
        //   self.startScan();
        //   self.status = LINK_STATUS_DISCONNECTED;
        //   self.trigger(EVENT_STATUS_CHANGE);
        // }
        
        self.isBleEnabled = true;
        self.autoConnect();
      }, () => {
        console.log('Bluetooth is *not* enabled');
        self.isBleEnabled = false;
        self.resetAutoConnect();
        self.deviceList = [];
        self.trigger(EVENT_LIST_CHANGE);
        if( self.status != LINK_STATUS_CLOSED){
          self.status = LINK_STATUS_CLOSED;
          self.trigger(EVENT_STATUS_CHANGE);
        }
      });
    }
  }

  resetAutoConnect() {
    console.log('resetAutoConnect');
    let self = this;
    self.connectedDevice = null;
    self._autoConnectTimer1 = 0;
    self._autoConnectTimer2 = 0;
    self._autoConnect = false;
    self._autoDeviceList = [];
    clearInterval(self._checkBleEnabledTimer);
    self._checkBleEnabledTimer = 0;
  }

  startAutoConnect() {
    let self = this;
    if(self._checkBleEnabledTimer == 0) {
      self._checkBleEnabledTimer = setInterval(self.checkBleEnabled.bind(self), 1000);
    }
  }

  getConditionSatisfy() {
    let self = this;
    console.log('_autoDeviceList.length:' + self._autoDeviceList.length + ',  _autoConnectTimer1:' + self._autoConnectTimer1 + ',  _autoConnectTimer2:' + self._autoConnectTimer2);
    if(self._autoDeviceList.length == 0) {
      self._autoConnectTimer1 = 0;
      self._autoConnectTimer2 = 0;
      return false;
    }

    if(self._autoDeviceList.length == 1) {
      self._autoConnectTimer2 = 0;
      if((self._autoDeviceList[0].id != null && self._autoDeviceList[0].id != self.connectedDevice) || self._autoDeviceList[0].distance > FIRST_DISTANCE) {
        self.connectedDevice = self._autoDeviceList[0].id;
        self._autoConnectTimer1 = 0;
      }

      if(self._autoDeviceList[0].distance <= FIRST_DISTANCE) {
        self._autoConnectTimer1 += 1;
      } else {
        self._autoConnectTimer1 = 0;
      }

      if (self._autoConnectTimer1 >= REACH_CONNECTABLE_TIMES) {
        console.log('_autoDeviceList.length:' + self._autoDeviceList.length + ',  _autoConnectTimer1:' + self._autoConnectTimer1 + ',  _autoConnectTimer2:' + self._autoConnectTimer2);
        return true;
      }
    }

    if(self._autoDeviceList.length > 1) {
      self._autoConnectTimer1 = 0;
      if((self._autoDeviceList[0].id != null && self._autoDeviceList[0].id != self.connectedDevice) || self._autoDeviceList[0].distance > FIRST_DISTANCE) {
        self.connectedDevice = self._autoDeviceList[0].id;
        self._autoConnectTimer2 = 0;
      }

      if(self._autoDeviceList[0].distance <= FIRST_DISTANCE &&  (self._autoDeviceList[1].distance - self._autoDeviceList[0].distance) >= SECOND_DISTANCE) {
        self._autoConnectTimer2 += 1;
      } else {
        self._autoConnectTimer2 = 0;
      }

      if(self._autoConnectTimer2 >= REACH_CONNECTABLE_TIMES) {
        console.log('_autoDeviceList.length:' + self._autoDeviceList.length + ',  _autoConnectTimer1:' + self._autoConnectTimer1 + ',  _autoConnectTimer2:' + self._autoConnectTimer2);
        return true;
      }
    }
    return false;
  }

  autoConnect() {
    let self = this;
    if(self._openScan) {
      if(self._autoConnect == false) {
        self.autoScan();
      }
      let condSatisfy = self.getConditionSatisfy();
      if(condSatisfy && self._autoConnect == false && self.connectedDevice != null) {
        console.log('condSatisfy && self._autoConnect == false navigator.platform:', navigator.platform);
        self._autoConnect = true;
        self._openScan = false;
        if(navigator.platform == 'iPad') {
          self.connect(self.connectedDevice);
        } else {
          setTimeout(function() {
            console.log('LinkStore:autoConnect timeout 2s');
            self.connect(self.connectedDevice);
          }, 2000);
        }
        
      }
    }
  }

  getStatus() {
    return this.status;
  }

  getDeviceList() {
    return this.deviceList;
  }

/*  getDeviceName() {
    let self = this;
    if( self.connectedDevice != null ) {
      for(let i=0; i < self._autoDeviceList.length; i++) {
        if(self._autoDeviceList[i].id == self.connectedDevice) {
          console.log('_autoDeviceList name:' + self._autoDeviceList[i].name);
          return self._autoDeviceList[i].name;
        }
      }
      for(let i = 0; i < self.deviceList.length; i++) {
        if(self.deviceList[i].id == self.connectedDevice) {
          console.log('deviceList name:' + self.deviceList[i].name);
          return self.deviceList[i].name;
        }
      }
    }
    console.log('no name self.connectedDevice:' + self.connectedDevice);
    return '';
  }*/

  addDevice(device) {
    let self = this;
    if(device.distance <= 2.5) {

      let needPut = true;
      for(let i = 0; i < self._autoDeviceList.length; i++) {
        if(self._autoDeviceList[i].id == device.id) {
          self._autoDeviceList[i].distance = device.distance;
          needPut = false;
          break;
        }
      }

      if(needPut) {
        if(self._autoDeviceList.length <= 1) {
          self._autoDeviceList.push(device);
        } else {
          //because we have sorted the device.distance from min to max below, so here we just need to compare the self._autoDeviceList[1] with the new input one
          if(device.distance < self._autoDeviceList[1].distance) {
            self._autoDeviceList[1].id = device.id;
            self._autoDeviceList[1].name = device.name;
            self._autoDeviceList[1].distance = device.distance;
          }
        }
      }

      if(needPut && self._autoDeviceList.length > 1) {
        if(self._autoDeviceList[1].distance < self._autoDeviceList[0].distance) {
          let id = self._autoDeviceList[0].id;
          let name = self._autoDeviceList[0].name;
          let distance = self._autoDeviceList[0].distance;
          self._autoDeviceList[0].id = self._autoDeviceList[1].id;
          self._autoDeviceList[0].name = self._autoDeviceList[1].name;
          self._autoDeviceList[0].distance = self._autoDeviceList[1].distance;
          self._autoDeviceList[1].id = id;
          self._autoDeviceList[1].name = name;
          self._autoDeviceList[1].distance = distance;
        }
      }
    }
    // for(let i = 0; i < self._autoDeviceList.length; i++) {
    //   console.log('autoDeviceList[' + i + '].name:' + self._autoDeviceList[i].name + ',distance:' + self._autoDeviceList[i].distance); 
    // }
  }

  autoScan() {
    let self = this;
    if( self.linkType == LINKTYPE_BLE ) {
      if(window.ble) {
        ble.stopScan();
        ble.startScan([], (device) => {
          if (!device.name || (device.name.indexOf('Makeblock') == -1 && device.name.indexOf('Neuron') == -1 && device.name.indexOf('Nueron') == -1)) {
            return;
          }
          device.distance = Math.pow(10.0, ((Math.abs(parseInt(device.rssi)) - 50.0) / 50.0)) * 0.7;
          self.addDevice(device);
        });
      }
    } else if( self.linkType == LINKTYPE_WIFI ) {
      // TODO
    }
  }

  startScan() {
    let self = this;
    self.deviceList = [];
    console.log('start scanning...');
    if( self.linkType == LINKTYPE_BLE ) {
      if(window.ble) {
        ble.stopScan();
        ble.startScan([], (device) => {
          if (!device.name || (device.name.indexOf('Makeblock') == -1 && device.name.indexOf('Neuron') == -1 && device.name.indexOf('Nueron') == -1)) {
            return;
          }

          if(device.name == 'Neuron_2G4' || device.name.indexOf('Neuron_2G4') != -1) {
            return;
          }
          console.log('device.name:', device.name);
          device.distance = Math.pow(10.0, ((Math.abs(parseInt(device.rssi)) - 50.0) / 50.0)) * 0.7;
          let found = false;
          for(let i = 0; i < self.deviceList.length; ++i) {
            if(self.deviceList[i].name == device.name) {
              self.deviceList[i].distance = device.distance;
              found = true;
              break;
            }
          }
          if(!found) {
            self.deviceList.push(device);
          }
          self.trigger(EVENT_LIST_CHANGE);
        });
      } else {
        console.log('window.ble is not available');
      }
    } else if( self.linkType == LINKTYPE_WIFI ) {
      console.log('self.linkType == LINKTYPE_WIFI');
    }
  }

  stopScan() {
    let self = this;
    clearInterval(self._checkBleEnabledTimer);
    self._checkBleEnabledTimer = 0;
    if( self.linkType == LINKTYPE_BLE ) {
      if(window.ble) {
        ble.stopScan();
      }
    }
  }

  connect(device) {
    let self = this;
    if (self.status != LINK_STATUS_CONNECTING) {
      self.status = LINK_STATUS_CONNECTING;
      self.trigger(EVENT_STATUS_CHANGE);
      if (self.linkType == LINKTYPE_BLE) {
        if (window.ble) {
          if( self.connectedDevice) {
            ble.disconnect(self.connectedDevice);
            self.connectedDevice = ble.connectedDeviceID = null;
          }
          ble.connect(device, function() {
            // connect success
            engine.setDriver('cordovable');
            engine.setUpdatingFalse();
            self._openScan = false;
            self._autoConnect = true;
            self.connectedDevice = ble.connectedDeviceID = device;
            self.stopScan(ble.connectedDeviceID);
            self.status = LINK_STATUS_CONNECTED;
            self.trigger(EVENT_STATUS_CHANGE);
            self.isBleEnabled = true;
            if(self._checkBleEnabledTimer == 0) {
              self._checkBleEnabledTimer = setInterval(self.checkBleEnabled.bind(self), 1000);
            }
          }, function(err) {
            // connect failure
            self._openScan = true;
            engine.closeDriver();
            self.resetAutoConnect();
            self.status = LINK_STATUS_FAILED;
            self.trigger(EVENT_STATUS_CHANGE);
            console.error('ble disconnect', err);
            self.startScan();
          });
          // timeout
          setTimeout(() => {
            if(self.status == LINK_STATUS_CONNECTING) {
              self._openScan = true;
              self.resetAutoConnect();
              self.status = LINK_STATUS_FAILED;
              self.trigger(EVENT_STATUS_CHANGE);
              console.error('connect timeout');
              self.startScan();
            }
          }, LINK_TIMEOUT);
        }
      } else if (self.linkType == LINKTYPE_WIFI) {
        // TODO
      }
    }
  }

  disconnect(needTrigger) {
    let self = this;
    if (self.linkType == LINKTYPE_BLE) {
      if (window.ble) {
        if (self.connectedDevice) {
          let lastConnectedDevice = ble.connectedDeviceID;
          self.connectedDevice = ble.connectedDeviceID = null;
          ble.disconnect(lastConnectedDevice, () => {
            // self._openScan = true;
            engine.closeDriver();
            self.resetAutoConnect();
            self.status = LINK_STATUS_DISCONNECTED;
            if(needTrigger == false) {
              self._openScan = false;
            } else {
              self._openScan = true;
            }
            self.trigger(EVENT_STATUS_CHANGE);
            console.log('[LinkStore::disconnect]_openScan:', self._openScan);
            if(self._openScan) {
              self.isBleEnabled = true;
              if(self._checkBleEnabledTimer == 0) {
                self._checkBleEnabledTimer = setInterval(self.checkBleEnabled.bind(self), 1000);
              }
            } else {
              self.isBleEnabled = false;
              clearInterval(self._checkBleEnabledTimer);
              self._checkBleEnabledTimer = 0;
            }
          });
        }
      }
    }
  }
}

let _instance = new LinkStore();


AppDispatcher.register((action) => {
  if (action.actionType == AppConstants.LINK_AUTO_CONNECT_DIALOG_OPEN) {
    console.log('start link-auto-connect scanning...');
    if(_instance.status != LINK_STATUS_CONNECTED) {
      _instance.isDialogOpen = true;
      _instance._openScan = true;
      _instance.resetAutoConnect();
      _instance.startAutoConnect();
    }
  } else if (action.actionType == AppConstants.LINK_DIALOG_OPEN) {
    console.log('start scanning...');
    _instance.isDialogOpen = true;
    _instance._openScan = false;
    _instance.resetAutoConnect();
    _instance.startScan();
  } else if(action.actionType == AppConstants.LINK_DIALOG_CLOSE) {
    console.log('stop scanning...');
    _instance.isDialogOpen = false;
    _instance._openScan = false;
    _instance.stopScan();
  } else if(action.actionType == AppConstants.LINK_DIALOG_CONNECT) {
    console.log('connecting device ', action.deviceId, '...');
    _instance.connect(action.deviceId);
  } else if(action.actionType == AppConstants.LINK_DIALOG_DISCONNECT) {
    console.log('disconnecting device...');
    _instance.disconnect(action.needTrigger);
  } else if(action.actionType == AppConstants.REFRESH_BLUETOOTH) {
    console.log('refresh Bluetooth device...');
    _instance.startScan();
  }
});

export default _instance;



