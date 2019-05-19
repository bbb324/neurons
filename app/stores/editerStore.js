import EventEmitter from 'wolfy87-eventemitter';
import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants from '../constants/AppConstants';
import engine from '../core/FlowEngine';
import cloudAppStore from './cloudAppStore';
import wifiStore from './wifiStore';
import UIActions from '../actions/UIActions';
const EVENT_NODE_ACTIVATE = 'activateNode';
const EVENT_NODE_CONFIG = 'configureNode';

class EditerStore extends EventEmitter {
  constructor() {
    super(...arguments);
    let self = this;
    this.activeNode = null;  // {id, type}
    this.configureNode = null; // {id, type}
    this.data = {
      nodes: [],
      wires: [],
    };

    this.addNodeId = '';

    AppDispatcher.register((action) => {
      if (action.actionType == AppConstants.EDITER_NODE_ADD) {
        let nodeInfo = action.nodeInfo;
        let nodeId = '';
        if (nodeInfo.id) {
          // elec nodes
          nodeId = nodeInfo.id;
        } else {
          // normal nodes
          nodeId = engine.addNode(nodeInfo.type);
        }
        //get outNodeId for autoDrawLine when addSubNode to canvas
        this.addNodeId = nodeId;

        self.data.nodes.push({
          id: nodeId,
          left: nodeInfo.left,
          top: nodeInfo.top,
          type: nodeInfo.type,
          category: nodeInfo.category,
          ins: [],
          outs: [],
          conf: {}
        });
        self.trigger('addNode');
        console.log('Init and Add');
        setTimeout( ()=>{
          engine.initNode(nodeId);
          cloudAppStore.updateCloudProject(); // update cloud data

          UIActions.setMicroNodeKey();

        }, 1);


      }
      else if (action.actionType == AppConstants.EDITER_NODE_MOVE) {
        let nodeInfo = action.nodeInfo;
        for (let i = 0; i < self.data.nodes.length; i++) {
          if (self.data.nodes[i].id == nodeInfo.id) {
            self.data.nodes[i].left = nodeInfo.left;
            self.data.nodes[i].top = nodeInfo.top;
          }
        }
        self.data.nodes = self.data.nodes;
        self.trigger('moveNode');
      }
      else if (action.actionType == AppConstants.EDITER_NODE_REMOVE ||
        action.actionType == AppConstants.EDITER_NODE_UNUSE) {
        // remove node in nodes list
        for (let i = 0; i < self.data.nodes.length; i++) {
          if (self.data.nodes[i].id == action.nodeId) {
            self.data.nodes.splice(i, 1);
          }
        }
        let wires = this.getWires(self.data.wires, action.nodeId); // wires contains removeWires, remainWires
        self.data.wires = wires.remainWires;
        self.trigger('removeNode', [wires.removeWires]);


        if(this.activeNode && this.activeNode.id === action.nodeId) {
          this.activeNode = null;
          self.trigger(EVENT_NODE_ACTIVATE);
        }
        cloudAppStore.updateCloudProject(); // update cloud data
      }
      else if (action.actionType == AppConstants.EDITER_WIRE_ADD) {
        let wireInfo = action.wireInfo;
        self.data.wires.push(wireInfo);
        self.trigger('addWire', [wireInfo]);

      }
      else if (action.actionType == AppConstants.EDITER_SINGLE_WIRE_REMOVE) {
        console.log('remove single wire');
        self.singleWireRemoved(action.wireId);
      }
      else if(action.actionType == AppConstants.NODE_TAP) {
        let type = action.nodeType;

        //说话，语音转文字节点,图片转文字，情绪检测
        if(type === 'TEXTTOSPEECH' || type === 'SPEAKERRECOGNIZE' || type === 'OCR' || type === 'EMOTION_TEST') {
          if(wifiStore.getWifiNetworkState() !== 'connected') {
            setTimeout(function () {
              UIActions.openWifiDialog('AP');
            }, 0);
            return;
          }else if((!localStorage.getItem('microCognitiveBingSpeech') &&  type === 'TEXTTOSPEECH') || (!localStorage.getItem('microCognitiveBingSpeech') && type === 'SPEAKERRECOGNIZE') || (!localStorage.getItem('microCognitiveComputerVision') && type === 'OCR') || (!localStorage.getItem('microCognitiveEmotion') && type === 'EMOTION_TEST')) {
            setTimeout(function () {
              UIActions.openMicroCognitiveDialog();
            }, 0);
            return;
          }
        }

        this.configureNode = {
          id: action.nodeId,
          type: action.nodeType
        };
        this.activeNode = {
          id: action.nodeId,
          type: action.nodeType
        };

        self.trigger(EVENT_NODE_ACTIVATE, [action.ele, action.nodeId]); //tapped element
        //self.trigger(EVENT_NODE_CONFIG);
      } else if(action.actionType == AppConstants.BEGIN_MOVING_NODE_TO_CANVAS) {
        self.configureNode = null;
        self.trigger(EVENT_NODE_CONFIG);
      } else if(action.actionType == AppConstants.MOVING_NODE) {
        this.activeNode = null;
        self.configureNode = null;
        self.trigger(EVENT_NODE_ACTIVATE);
        self.trigger(EVENT_NODE_CONFIG);
      }

    });
  }

  singleWireRemoved(wireID) {
    let index = this.data.wires.indexOf(wireID);
    this.data.wires.splice(index, 1);
    this.trigger('removeSingleWire', [this.data.wires]);  // pass the total remain wires
  }

  clearDate(){
    console.log('clean data');
    this.data = {
      nodes: [],
      wires: [],
    };
  }

  clearConfig(){
    this.activeNode = null;
    this.configureNode = null;
  }

  insertDate(nodes, wires){
    for(let i=0; i<nodes.length; i++){
      this.data.nodes.push(nodes[i]);
    }
    for(let i=0; i<wires.length; i++){
      this.data.wires.push(wires[i]);
    }
  }
  get() {
    return this.data;
  }

  getActiveNode() {
    return this.activeNode;
  }

  getConfigureNode() {
    return this.configureNode;
  }

  getWires(wireList, id){
    let wireInfo = id;  // able to get wireInfo through node id
    let wires = {
      removeWires: [],
      remainWires: [],
    };
    //get wire list that should remove
    for (let i = 0; i < wireList.length; i++) {
      for (let j = 0; j < wireList[i].split('&').length; j++) {
        if (wireInfo == wireList[i].split('&')[j]) {
          wires.removeWires.push(wireList[i]);
        }
      }
    }

    //get wire list that should remain
    for(let i=0; i<wireList.length; i++){
      if(wires.removeWires.indexOf(wireList[i])==-1){
        wires.remainWires.push(wireList[i]);
      }
    }
    return wires;
  }

}

let _instance = new EditerStore();


export default _instance;
