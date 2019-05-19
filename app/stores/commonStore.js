import EventEmitter from 'wolfy87-eventemitter';
import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants from '../constants/AppConstants';
import engine from '../core/FlowEngine';
import editerStore from './editerStore';
import nodeStore from './nodeStore';

class commonStore extends EventEmitter {
  constructor() {
    super(...arguments);
    this.ServoId = '';
    this.ServoNo = '';
    this.servoLength = '';
    let self = this;
    this.canvasStatus = '';
    AppDispatcher.register((action)=>{
      switch (action.actionType) {
      case AppConstants.OPEN_SMART_SERVO_DIALOG:
        self.servoId = action.servoId;
        self.servoNo = action.servoNo;
        self.servoLength = action.servoLength;
        self.trigger('openSmartServoDialog');
        break;
      case AppConstants.SYNC_SERVO_NO_CONFIGURATOR:
        self.servoId = action.servoId;
        self.servoNo = action.servoNo;
        self.trigger('syncServoNoToConfigurator');
        break;
      case AppConstants.SEQUENCE_NODE_EVENT: {
        if (action.event == 'add') {
          let result = engine.addOutputPort(action.nodeId);
          let svgArray = document.querySelectorAll('svg');
          let wires = [];
          NodeList.prototype.forEach = Array.prototype.forEach;
          svgArray.forEach(svg=>{
            if(svg.id!='') {   // exclude fake wire
              wires.push(svg.id);
            }
          });
          self.trigger('sequencePortAdd', [result, wires]);
          break;
        } else {
          let svgName = action.nodeId + '-'+ action.portId;
          NodeList.prototype.forEach = Array.prototype.forEach;
          let svgArray = document.querySelectorAll('svg');
          let svgIdList = [];
          let remainWires = [];
          svgArray.forEach(svg=>{
            if(svg.id.indexOf(svgName)!= -1) {
              svg.remove();
              svgIdList.push(svg.id);
            } else {
              if(svg.id!='') {   // exclude fake wire
                remainWires.push(svg.id);
              }
            }
          });
          for (let i = 0; i < svgIdList.length; i++) {
            editerStore.singleWireRemoved(svgIdList[i]);
            nodeStore.singleWireRemoved(svgIdList[i]);
          }
          let result = engine.removeOutputPort(action.nodeId, action.portId);
          self.trigger('deletePort', [result, remainWires]);
          self.trigger('hideConfig');
          break;
        }
      }
      case AppConstants.SAVE_CANVAS_STATUS: {
        self.canvasStatus = action.canvasStatus;
        break;
      }
      case AppConstants.SHOW_PORT_CONFIG: {
        self.trigger('showPortConfig', [action.portId]);
        break;
      }
      case AppConstants.OPEN_CONFIGURATOR_WITH_SUBNODE:
        self.trigger('openConfiguratorWithSubNode', [action.nodeId]);
        break;
      default:
        break;
      }
    });
  }
  getCanvasStatus() {
    return this.canvasStatus;
  }
}

export default new commonStore();