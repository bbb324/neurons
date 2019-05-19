import EventEmitter from 'wolfy87-eventemitter';
import engine from '../core/FlowEngine';

import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants from '../constants/AppConstants';
import firmwareStore from './firmwareStore';

let EVENT_NODE_LIST_CHANGED = 'ElectronicNodesListChange';
let EVENT_NODE_INPUT_CHANGED = 'NodeInputChange';
let EVENT_NODE_OUTPUT_CHANGED = 'NodeOutputChange';
let EVENT_NODE_CONNECTION_STATUS_CHANGED = 'NodeConnectionStatusChange';
let EVENT_SAMETYPE_NODE_COUNT_CHANGED = 'SameTypeNodeCountChange';

let REMOVE_CONTROL_NODE = 'removeControlNode';

class NodeStore extends EventEmitter {
  constructor() {
    super();
    let self = this;
    self._electronicNodeList = [];
    self._unusedElectronicNodeList = [];
    self._unusedElectronicNodeListCopy = [];
    self._usedElectronicNodes = {};
    self._sameTypeCount = {};

    engine.on('NodeListChanged', function(nodes) {
      console.log('NodeListChanged', nodes);
      self._unusedElectronicNodeListCopy = self._unusedElectronicNodeList;
      self._electronicNodeList = nodes;
      self.refreshUnusedNodes();
      self.setUnusedNodesVersion();
      self.trigger(EVENT_NODE_LIST_CHANGED);
    });

    engine.on('NodeOutputChanged', function(id, port, value) {
      self.trigger(EVENT_NODE_OUTPUT_CHANGED, [{
        id: id,
        port: port,
        value: value
      }]);
    });

    engine.on('NodeInputChanged', function(id, port, value) {
      self.trigger(EVENT_NODE_INPUT_CHANGED, [{
        id: id,
        port: port,
        value: value
      }]);
    });

    engine.on('NodeConnectionStatusChanged', function(status) {
      console.log(status);
      self.trigger(EVENT_NODE_CONNECTION_STATUS_CHANGED, [{
        id: status.id,
        status: status.state
      }]);
      if(status.state == 'connected') {
        engine.getBlockVersionById(status.id);
      }
    });

    engine.on('SameTypeNodeCountChanged', function(msg) {
      self._sameTypeCount[msg.type] = msg.count;
      self.trigger(EVENT_SAMETYPE_NODE_COUNT_CHANGED, [msg.type]);
    });

    engine.on('NodeVersion', function(versionRet) {
      console.log('[NodeStore] NodeVersion versionRet:', versionRet);
      self.setNodeVersion(versionRet.id, versionRet.update);
      self.trigger(EVENT_NODE_LIST_CHANGED);
    });

    engine.on('NodeSetFirmware', function(typeObj) {
      console.log('[NodeStore] NodeSetFirmware typeObj:', typeObj);
      firmwareStore.setFirmwareByTypeAndSubtype(typeObj.type, typeObj.subtype);
    });

    AppDispatcher.register((action) => {
      if (action.actionType == AppConstants.EDITER_NODE_USE){
        self.setUsed(action.nodeId);
      } else if (action.actionType == AppConstants.EDITER_NODE_UNUSE) {
        self.setUnused(action.nodeId);
      } else if (action.actionType == AppConstants.EDITER_NODE_REMOVE) {
        engine.removeNode(action.nodeId);
      } else if(action.actionType == AppConstants.EDITER_NODE_REMOVE_CONTROL) {
        self.removeControlNode();
      } else if (action.actionType == AppConstants.EDITER_NODE_CONFIG) {
        engine.configNode(action.nodeId, action.conf,action.play);
      } else if(action.actionType == AppConstants.EDITER_WIRE_ADD){
        console.log(action.wireInfo);
        let wireSet = action.wireInfo.split('&');
        let sourceNodeId = wireSet[0];
        let sourcePort = wireSet[1].replace(sourceNodeId + '-', '');
        let targetNodeId = wireSet[2];
        let targetPort = wireSet[3].replace(targetNodeId + '-', '');
        engine.connect(
          sourceNodeId,
          sourcePort,
          targetNodeId,
          targetPort
        );
      }else if (action.actionType == AppConstants.EDITER_SINGLE_WIRE_REMOVE) {
        self.singleWireRemoved(action.wireId);
      } else if(action.actionType == AppConstants.PROJECT_CREATE || action.actionType == AppConstants.PROJECT_OPEN) {
        self.setUsedElectronicNodes({});
      } else if(action.actionType == AppConstants.INIT_CONFIG) {
        self.initConfig(action.nodeId, action.play);
      }
    });
  }

  singleWireRemoved(wireID) {
    let wireSet = wireID.split('&');
    let sourceNodeId = wireSet[0];
    let sourcePort = wireSet[1].replace(sourceNodeId + '-', '');
    let targetNodeId = wireSet[2];
    let targetPort = wireSet[3].replace(targetNodeId + '-', '');
    engine.disconnect(
      sourceNodeId,
      sourcePort,
      targetNodeId,
      targetPort
    );
  }

  refreshUnusedNodes() {
    let self = this;
    let nodes = self._electronicNodeList;
    self._unusedElectronicNodeList = [];
    for (let i = 0; i < nodes.length; i++) {
      if (!(nodes[i].id in self._usedElectronicNodes)) {
        self._unusedElectronicNodeList.push(nodes[i]);
      } else {
        self._usedElectronicNodes[nodes[i].id] = nodes[i];
      }
    }
  }

  setUnusedNodesVersion() {
    let self = this;
    let nodes = self._unusedElectronicNodeList;
    for (let i = 0; i < nodes.length; i++) {
      for(let j = 0; j < self._unusedElectronicNodeListCopy.length; ++j) {
        if(nodes[i].id == self._unusedElectronicNodeListCopy[j].id) {
          self._unusedElectronicNodeList[i].update = self._unusedElectronicNodeListCopy[j].update;
          break;
        }
      }
    }
  }

  setNodeVersion(id, update) {
    let self = this;
    for(let i = 0; i < self._unusedElectronicNodeList.length; i++) {
      if(self._unusedElectronicNodeList[i].id == id) {
        self._unusedElectronicNodeList[i].update = update;
        console.log('self._unusedElectronicNodeList[i]:', self._unusedElectronicNodeList[i]);
        break;
      }
    }
  }

  getNodeInputValue(id,port){
    return engine.getNodeInputValue(id, port);
  }

  getUnusedElectronicNodes() {
    return this._unusedElectronicNodeList;
  }

  isElectronicNodeConnected( nodeId ) {
    for(let i=0; i<this._electronicNodeList.length; i++) {
      if(this._electronicNodeList[i].id == nodeId) {
        return true;
      }
    }
    return false;
  }

  setUsedElectronicNodes(usedNodes) {
    this._usedElectronicNodes = usedNodes;
    this.refreshUnusedNodes();
  }

  getElectronicNodes() {
    return this._electronicNodeList;
  }

  getElectronicNodesCount() {
    return this._electronicNodeList.length;
  }

  getSameTypeCount(type) {
    return this._sameTypeCount[type] || 0;
  }

  setUsed(id) {
    this._usedElectronicNodes[id] = null;
    for (let i = 0; i < this._unusedElectronicNodeList.length; i++) {
      if (this._unusedElectronicNodeList[i].id == id) {
        this._usedElectronicNodes[id] = this._unusedElectronicNodeList[i];
        this._unusedElectronicNodeList.splice(i, 1);
      }
    }
    engine.useNode(id);
    this.trigger(EVENT_NODE_LIST_CHANGED);
  }

  setUnused(id) {
    for (let i = 0; i < this._electronicNodeList.length; i++) {
      if (id == this._electronicNodeList[i].id) {
        this._unusedElectronicNodeList.push(this._usedElectronicNodes[id]);
        break;
      }
    }
    delete this._usedElectronicNodes[id];
    engine.unUseNode(id);
    console.log(this._unusedElectronicNodeList);
    this.trigger(EVENT_NODE_LIST_CHANGED);
  }

  // for common nodes
  useNode(id) {
    engine.useNode(id);
  }

  initNode(id) {
    engine.initNode(id);
  }

  getNodeTypes(){
    return engine.getNodeTypes();
  }

  getNodeConfigs(nodeId) {
    return engine.getNodeConfigs(nodeId);
  }

  getCurrentConfig(nodeId, key) {
    return engine.getNodeCurrentConfig(nodeId, key);
  }

  removeControlNode() {
    this.trigger(REMOVE_CONTROL_NODE);
  }

  initConfig(nodeId, play) {
    let configs = this.getNodeConfigs(nodeId);
    for ( let key in configs){
      if(configs.hasOwnProperty(key) && configs[key].hasOwnProperty('defaultValue')) {
        this.onConfig(nodeId, key, configs[key].defaultValue, play);
      }
    }
  }
  onConfig(nodeId, key, value, play){
    if('undefined' === (typeof play)){
      play = true;
    }
    let conf = {[key]: value};
    engine.configNode(nodeId, conf, play);
  }

}

export default new NodeStore();