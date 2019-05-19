import { TouchHandler } from './TouchHandler';
import UIActions from '../../actions/UIActions';
import { WireUtils } from './WireUtils';
import { NodeUtils } from './NodeUtils';

//touch or move node handler
class NodeTouchHandler extends TouchHandler {
  constructor() {
    super(...arguments);
    this.canMove = false;
    this.draggingObject = null;
    this.hasMoved = false;
    this.otherOutputPortsXY = [];
    this.minDistanceIndex = -1;
    this.autoConnectMinDistance = 80;
    this.lists = null;
    this.isHighlightNode = false;
    this._longpressTimeout = 1000;
    this._actionState = '';
    this._isLongpressNode = false;
    this._timeoutId = 0;
    this._paletteTop = 0;
    this._shelfTop = 0;
    this._shelfLeft = 0;
    this._shelfRight = 0;
    this._bluetoothWidth = 0;
    this._dragDeleteAble = false;
    this._intersectionLength = 10;
    this._preventShakeLength = 10;
    this.highlight = {
      node: null, port: null
    };
    this.zIndex = 1;
    this.curConfigStatus = null;
    this.movingEvent = false;
    this._touchNode = false;
    this._maxDiffTime = 50;
    this._lastMoveNodeTime = 0;
    this._currentMoveNodeTime = 0;
  }

  onStart(e) {
    this._touchNode = false;
    if (e.target.closest('.node-draggable') && e.touches.length==1) {
      this._touchNode = true;
      this.canMove = true;
      this._dragDeleteAble = false;
      this.zoom = this.container.state.zoom;
      this.draggingObject = e.target.closest('.node-actual');
      this.touchX = this._touches(e)[0].pageX;
      this.touchY = this._touches(e)[0].pageY;
      this.baseLeft = parseInt(this.draggingObject.style.left);
      this.baseTop = parseInt(this.draggingObject.style.top);
      this.getOtherNodeOutputPorts();
      this._actionState = 'onStart';
      this._isLongpressNode = false;
      clearTimeout(this._timeoutId);
      this._timeoutId = setTimeout(()=>{
        if(this._actionState == 'onStart') {
          if(this.draggingObject.classList.contains('no-deleteBtn-display')){
            this._isLongpressNode = false;
            this.draggingObject.classList.remove('no-deleteBtn-display');
          } else {
            this._isLongpressNode = true;
            this.container.emitter.emit('longpressNode', {id: this.draggingObject.id});
          }
        }
      }, this._longpressTimeout);
      setTimeout(()=>{
        this.getDeleteBorderLimit();
      }, 500);
      this.draggingObject.style.zIndex = (++this.zIndex);
    }
  }

  onMove(e) {
    if(!this._touchNode) {
      return;
    }
    if(e.target.closest('.no-draggable')!=null){ this._actionState = 'onEnd'; return;}
    this._actionState = 'onMove';
    if (this.canMove && this._fingers(e) == 1) {
      this._currentMoveNodeTime = new Date().getTime();
      let diffTime = this._currentMoveNodeTime - this._lastMoveNodeTime;
      if( diffTime <= this._maxDiffTime ) {
        // console.log('CanvasTouches:onMove diffTime:', diffTime);
        return;
      }
      // console.log('CanvasTouches:onMove diffTime:', diffTime);
      this._lastMoveNodeTime = this._currentMoveNodeTime;
      let deltaX = (this._touches(e)[0].pageX - this.touchX) / this.zoom;
      let deltaY = (this._touches(e)[0].pageY - this.touchY) / this.zoom;

      if(Math.abs(deltaX) <= this._preventShakeLength && Math.abs(deltaY) <= this._preventShakeLength) {
        this._actionState = 'onStart';
      }
      
      this.draggingObject.style.left = this.baseLeft + deltaX + 'px';
      this.draggingObject.style.top = this.baseTop + deltaY + 'px';
      let arrays = this.getRelatedWire(this.draggingObject.id);
      if (arrays.length != 0) {
        for (let i = 0; i < arrays.length; i++) {
          let dragStartPort = arrays[i].split('&')[1];  // the start port id
          let startPortCenter = this._getPortCenter(document.getElementById(dragStartPort));
          let dragEndPort = arrays[i].split('&')[3];  // the end port id
          let endPortCenter = this._getPortCenter(document.getElementById(dragEndPort));
          if (startPortCenter != null && endPortCenter != null) {
            WireUtils.drawWire(startPortCenter[0], startPortCenter[1], endPortCenter[0], endPortCenter[1], document.getElementsByClassName(arrays[i])[0]);
          }
        }
      }
      if (this.movingEvent == false)
      {
        UIActions.movingNode();
        this.movingEvent = true;
      }
      if (this.curConfigStatus == null && this.draggingObject.querySelector('.node-config')) {
        if(this.draggingObject.querySelector('.node-config').classList.contains('hide') == true) {
          this.curConfigStatus = 'hide';
        } else {
          this.curConfigStatus = 'show';
        }
      }
      this.hasMoved = true;
      this.autoDrawDashLine();
      let rect = this.draggingObject.getBoundingClientRect();
      this.dragDeleteNode(this.draggingObject.dataset.category, rect.top, rect.bottom, rect.left, rect.right);
    }
  }


  getDeleteBorderLimit() {
    this._bluetoothWidth = 0;
    if(document.querySelector('.connect-icon') != null) {
      let BleOrWifiRect = document.querySelector('.connect-icon').getBoundingClientRect();
      this._bluetoothWidth = BleOrWifiRect.width;
    }
    // let BleOrWifiRect = document.querySelector('.connect-icon').getBoundingClientRect();
    let PaletteEditerRect = document.querySelector('.editer-palette-nodes').getBoundingClientRect();
    let ShelfEditerRect = document.querySelector('.editer-shelf').getBoundingClientRect();
    // this._bluetoothWidth = BleOrWifiRect.width;
    this._paletteTop = PaletteEditerRect.top;
    this._shelfTop = ShelfEditerRect.bottom;
    this._shelfLeft = ShelfEditerRect.left + this._bluetoothWidth;
    this._shelfRight = ShelfEditerRect.right;

  }

  dragDeleteNode(category, top, bottom, left, right) {
    this._dragDeleteAble = false;
    // if(category == 'electronic') {
    //   if((top + this._intersectionLength) < this._shelfTop) {
    //     if(left < this._shelfRight && right > this._shelfLeft) {
    //       this._dragDeleteAble = true;
    //     } 
    //   }
    // } else {
    //   if(bottom > (this._paletteTop + this._intersectionLength)) {
    //     this._dragDeleteAble = true;
    //   }
    // }
    let tempCategory = category;
    this._paletteTop = document.querySelector('.editer-palette-nodes').getBoundingClientRect().top;
    if((top + this._intersectionLength) < this._shelfTop) {
      if(left < this._shelfRight && right > this._shelfLeft) {
        this._dragDeleteAble = true;
        tempCategory = 'electronic';
      }
    } else if(bottom > (this._paletteTop + this._intersectionLength)) {
      this._dragDeleteAble = true;
      tempCategory = 'notElectronic';
    }

    if(this._dragDeleteAble) {
      // NodeUtils.addDragDelete(this.draggingObject);
      this._showDeleteTips(tempCategory, true);
    } else {
      // NodeUtils.removeDragDelete(this.draggingObject);
      this._showDeleteTips('electronic', false);
      this._showDeleteTips('notElectronic', false);
    }
    
  }

  getRelatedWire(id) {
    let wires = this.container.state.wires;
    let arr = [];
    for (let i = 0; i < wires.length; i++) {
      let tmp = wires[i].split('&');
      if (tmp.indexOf(id) != -1) {
        arr.push(wires[i]);
      }
    }
    return arr;
  }

  calculateDistance(outputX, outputY, inputX, inputY) {
    let xDiff = outputX - inputX;
    let yDiff = outputY - inputY;
    let distance = Math.pow((xDiff*xDiff + yDiff*yDiff), 0.5);
    return distance;
  }

  isObjectEmpty(obj) {
    if(obj && obj.xCoor != null && obj.yCoor != null) {
      return false;
    }
    return true;
  }

  autoDrawDashLine() {
    let inputXYObj = this.getFirstInputPortXY();
    if(this.isObjectEmpty(inputXYObj)) {
      return;
    }
    if(inputXYObj.needDraw != null && inputXYObj.needDraw == false) {
      return;
    }
    //get minDistance outputPort
    let minDistanceIndex = 0;
    let minDistance = 99999;
    for(let i = 0; i < this.otherOutputPortsXY.length; ++i) {
      let outputXYObj = this.otherOutputPortsXY[i];
      let distance = this.calculateDistance(outputXYObj.xCoor, outputXYObj.yCoor, inputXYObj.xCoor, inputXYObj.yCoor);
      if(distance < minDistance) {
        minDistance = distance;
        minDistanceIndex = i;
      }
    }
    //drawline
    if(minDistance <= this.autoConnectMinDistance) {  // start draw dash line
      let outputXYObj = this.otherOutputPortsXY[minDistanceIndex];
      this.highlight.node = document.getElementById(outputXYObj.nodeId);
      this.highlight.port = this.highlight.node.querySelector('[id="'+ outputXYObj.portId +'"]');
      NodeUtils.portSwitch(this.highlight.node, this.highlight.port, this.container.refs.fakewire);
      WireUtils.drawWire(outputXYObj.xCoor, outputXYObj.yCoor, inputXYObj.xCoor, inputXYObj.yCoor, this.container.refs.fakewire);
      WireUtils.dashWire(this.container.refs.fakewire, true);
      this.isHighlightNode = true;

      this.minDistanceIndex = minDistanceIndex;
      if(this.nodeRelation(this.draggingObject, this.highlight.node, outputXYObj.portId, inputXYObj.portId) == false){
        NodeUtils.singlePortEnlarge(this.highlight.node, this.highlight.port);
      }
    } else {
      if (this.isHighlightNode) {
        NodeUtils.clearNodeStatus(this.highlight.node, this.highlight.port, this.container.refs.fakewire);
      }
      WireUtils.dashWire(this.container.refs.fakewire, false);
      this.container.refs.fakewire.style.display = 'none';
      this.minDistanceIndex = -1;
    }
  }

  nodeRelation(draggingNode, targetNode, outputPort, inputPort) {
    //draggingNode is the source, target Node is the target
    let preWire = targetNode.id+'&'+outputPort+'&'+draggingNode.id+'&'+inputPort;
    let wires = this.container.state.wires;
    let flag = false;
    for(let i=0; i<wires.length; i++){
      if(wires[i]==preWire){
        flag = true;
        break;
      }
    }
    return flag;
  }

  autoDrawRealLine() {
    if(this.hasMoved == false) {
      return;
    }

    if(this.minDistanceIndex == -1) {
      return;
    }

    WireUtils.dashWire(this.container.refs.fakewire, false);
    this.container.refs.fakewire.style.display = 'none';
    let inputXYObj = this.getFirstInputPortXY();
    let outputXYObj = this.otherOutputPortsXY[this.minDistanceIndex];

    if(this.isObjectEmpty(inputXYObj) || this.isObjectEmpty(outputXYObj)) {
      return;
    }

    if(inputXYObj.needDraw != null && inputXYObj.needDraw == false) {
      return;
    }

    let distance = this.calculateDistance(outputXYObj.xCoor, outputXYObj.yCoor, inputXYObj.xCoor, inputXYObj.yCoor);
    if(distance > this.autoConnectMinDistance) {
      return;
    }

    // sourceNodeid&sourcePortId&targetNodeId&targetPortId
    let wire = outputXYObj.nodeId + '&' + outputXYObj.portId + '&' + inputXYObj.nodeId + '&' + inputXYObj.portId;
    if(this.container.state.wires.indexOf(wire) != -1) {
      return;
    }

    let newSvg = WireUtils.createSvg(wire);
    WireUtils.setWireInfo(newSvg, outputXYObj.nodeId, outputXYObj.portId, inputXYObj.nodeId, inputXYObj.portId);
    WireUtils.drawWire(outputXYObj.xCoor, outputXYObj.yCoor, inputXYObj.xCoor, inputXYObj.yCoor, newSvg);
    this.container.refs.canvas.appendChild(newSvg);
    this.container.emitter.emit('addWire', {wire: wire});
  }

  getFirstInputPortXY() {
    let xyObj = {};
    let xyCoor = null;
    let inputPorts = null;

    if(this.draggingObject == null) {
      return null;
    }

    inputPorts = this.draggingObject.querySelectorAll('.node-port-input');
    if(inputPorts == null || inputPorts.length == 0) {
      return null;
    }

    xyCoor = this._getPortCenter(inputPorts[0]);
    xyObj.xCoor = xyCoor[0];
    xyObj.yCoor = xyCoor[1];
    xyObj.nodeId = this.draggingObject.id;
    if(inputPorts[0].childNodes.length > 0) {
      xyObj.portId = inputPorts[0].id;
    } else {
      xyObj.needDraw = false;
    }
    return xyObj;
  }

  getOtherNodeOutputPorts() {
    this.otherOutputPortsXY = [];
    let outputPorts = document.querySelectorAll('.node-port-output');
    for(let i = 0; i < outputPorts.length; ++i) {

      let outputNodeId = outputPorts[i].closest('.node-actual').id;
      if(outputNodeId != this.draggingObject.id) {
        let outputXYObj = {};
        let outputXY = this._getPortCenter(outputPorts[i]);
        outputXYObj.xCoor = outputXY[0];
        outputXYObj.yCoor = outputXY[1];
        outputXYObj.nodeId = outputNodeId;
        outputXYObj.portId = outputPorts[i].id;
        this.otherOutputPortsXY.push(outputXYObj);
      }
    }
  }

  onEnd(e) {
    if(!this._touchNode) {
      return;
    }
    this._actionState = 'onEnd';
    this.autoDrawRealLine();
    if (this.canMove) {
      this.canMove = false;

      if(this._dragDeleteAble) {
        this._dragDeleteAble = false;
        this.container.emitter.emit('deleteNode', {
          id: this.draggingObject.id,
          category: this.draggingObject.dataset.category
        });
        if(this.highlight){  //when autodelete node, clear its highligh status
          NodeUtils.clearNodeStatus(this.highlight.node, this.highlight.port);
        }
        return;
      }

      if( this.hasMoved ){
        this.container.emitter.emit('moveNode', {
          id: this.draggingObject.id,
          top: parseInt(this.draggingObject.style.top),
          left: parseInt(this.draggingObject.style.left)
        });
        if(this.highlight.node) {
          NodeUtils.clearNodeToNodeConnection(this.highlight.node, this.highlight.port);
        }
        if (this.curConfigStatus == 'show') {
          UIActions.nodeTap(this.draggingObject.id, this.draggingObject.dataset.type, e.target);
        }
      } else {
        if(!this._isLongpressNode) {
          UIActions.nodeTap(this.draggingObject.id, this.draggingObject.dataset.type, e.target);
        }
      }
      this.movingEvent = false;
      this.curConfigStatus = null;
      this.isHighlightNode = false;
      this.hasMoved = false;
    }
  }
}


//touch or move node port handler
class PortTouchHandler extends TouchHandler {
  constructor() {
    super(...arguments);
    this.willConnect = false;
    this.sign = '&';
    this.currentWire = {start: '', end: ''};
    this.startNode = null;
    this.startPortType = '';

    this.startX = -1;
    this.startY = -1;
    this.endX = -1;
    this.endY = -1;

    this.startOutput = false;
    this.startInput = false;
    this.canDraw = false;
    this.enlargedNode = null; // store enlarged node
    this.enlargedPort = null; // store style changed port
    this.lists = null;
    this._touchPort = false;
  }

  onStart(e) {
    this._touchPort = false;
    if (e.target.closest('.node-port') && e.touches.length==1) {
      this._touchPort = true;
      let startPort = e.target.closest('.node-port');
      this.resetStartInputOutput();
      this.willConnect = true;
      this.startNode = startPort.closest('.node-actual');
      this.startPortType = startPort.dataset.type;


      let startPosition = this._getPortCenter(startPort);
      this.startX = startPosition[0];
      this.startY = startPosition[1];

      this._setWireStart(startPort, this.startNode);
      this.lists = NodeUtils.addEnlarge(startPort);  // store ports needs to shrink
    }
  }

  onMove(e) {
    if(!this._touchPort) {
      return;
    }
    //draw line function
    if (this.willConnect) {
      let xy = [this._touches(e)[0].pageX, this._touches(e)[0].pageY];
      let obj = {
        left: this.container.state.left,
        top: this.container.state.top,
        zoom: this.container.state.zoom
      };
      xy = this._getPosition(xy, obj);
      let touchX = xy[0];
      let touchY = xy[1];
      WireUtils.drawWire(this.startX, this.startY, touchX, touchY, this.container.refs.fakewire);
      let touchedElement = document.elementFromPoint(this._touches(e)[0].pageX, this._touches(e)[0].pageY);
      if (touchedElement) {
        let endPort = touchedElement.closest('.node-port');
        let endNode = touchedElement.closest('.node-actual');
        if(endPort == null) {
          endPort = this.getFirstPort(endNode);
        }
        if(endNode != this.startNode && endPort!=null) {
          if(endPort.dataset.type != this.startPortType)
          {
            let endPosition = this._getPortCenter(endPort);
            this.endX = endPosition[0];
            this.endY = endPosition[1];
            this.canDraw = this.isDrawable(endPort, endNode);
            if (this.canDraw) {
              let nodePort = NodeUtils.enlargeNode(endNode, endPort, this.container.refs.fakewire);
              this.enlargedNode = nodePort.node;
              this.enlargedPort = nodePort.port;
            } else {
              NodeUtils.clearHighlightNode(this.enlargedNode, this.enlargedPort, this.container.refs.fakewire);
            }
          }
          else {
            if (this.enlargedNode != null) {
              this.canDraw = false;
              NodeUtils.clearHighlightNode(this.enlargedNode, this.enlargedPort, this.container.refs.fakewire);
            }
          }
        }
        else {  // in canvas area
          if (this.enlargedNode != null) {
            this.canDraw = false;
            NodeUtils.clearHighlightNode(this.enlargedNode, this.enlargedPort, this.container.refs.fakewire);
          }
        }
      }
    }
  }

  onEnd() {
    if(!this._touchPort) {
      return;
    }
    // disappear line, update state
    if (this.willConnect) {
      this.willConnect = false;
      if (this.canDraw) {
        this.drawRealLine();
        this.canDraw = false;
        NodeUtils.clearEnlargedPort(this.lists.enlargedList, this.lists.shrinkedList);
        NodeUtils.clearHighlightNode(this.enlargedNode, this.enlargedPort, this.container.refs.fakewire);
      } else {
        NodeUtils.clearEnlargedPort(this.lists.enlargedList, this.lists.shrinkedList);
      }
      this.enlargedNode = null;
    }
    this.container.refs.fakewire.style.display = 'none';
    this.resetStartInputOutput();
  }

  getFirstPort(endNode) {
    let endPort = null;
    let ports = null;

    if(endNode == null) {
      return null;
    }

    let queryStr = '';
    if(this.startOutput && this.startInput == false) {
      queryStr = '.node-port-inputs';
    } else if(this.startInput && this.startOutput == false) {
      queryStr = '.node-port-outputs';
    } else {
      console.log('Error!!! Unexpected case. WTF');
      return null;
    }

    ports = endNode.querySelectorAll(queryStr);
    if(ports == null || ports.length == 0) {
      return null;
    }

    if(ports[0].childNodes.length == 0) {
      return null;
    }

    endPort = ports[0].childNodes[0];
    return endPort;
  }

  isDrawable(endPort, endNode) {
    this._setWireEnd(endPort, endNode);
    let flag = false;
    let wire = this._getWire();
    if (this.container.state.wires.indexOf(wire) != -1 || this.startNode == endNode || this.startPortType == endPort.dataset.type) {
      // this.container.state.wires.indexOf(wire) == -1                 // do not all duplicate connection
      // startNode != endNode                                           // do now allow self connection
      // this.startPort.dataset.type != endPort.dataset.type            // do now allow same port connection
      flag = false;
    }else {
      flag = true;
    }
    return flag;
  }

  drawRealLine() {
    let sourceNodeId = this.currentWire.start.split(this.sign)[0];
    let sourcePortId = this.currentWire.start.split(this.sign)[1];
    let targetNodeId = this.currentWire.end.split(this.sign)[0];
    let targetPortId = this.currentWire.end.split(this.sign)[1];

    let wire = this._getWire();
    let newSvg = WireUtils.createSvg(wire);
    WireUtils.setWireInfo(newSvg, sourceNodeId, sourcePortId, targetNodeId, targetPortId);
    WireUtils.drawWire(this.startX, this.startY, this.endX, this.endY, newSvg);

    this.container.refs.canvas.appendChild(newSvg);
    this.container.emitter.emit('addWire', {wire: wire});
  }


  _setWireStart(port, ele){
    if(port.classList.contains('node-port-input'))
    {
      this.currentWire.end = ele.id + this.sign + port.id;
      this.setStartInput();
    } else {
      this.currentWire.start = ele.id + this.sign + port.id;
      this.setStartOutput();
    }
  }
  _setWireEnd(port, ele){
    if(port.classList.contains('node-port-output'))
    {
      this.currentWire.start = ele.id + this.sign + port.id;
    } else {
      this.currentWire.end = ele.id + this.sign + port.id;
    }
  }
  _getWire(){
    let wireRet = this.currentWire.start + '&' + this.currentWire.end;
    return wireRet;
  }

  resetStartInputOutput() {
    this.startOutput = false;
    this.startInput = false;
  }

  setStartInput() {
    this.startInput = true;
    this.startOutput = false;
  }

  setStartOutput() {
    this.startInput = false;
    this.startOutput = true;
  }


}


//touch or move canvas handler
class CanvasTouchHandler extends TouchHandler {
  constructor() {
    super(...arguments);
    this.willPan = false;
    this.willZoom = false;
    this.initDist = 0;
    this.ratio = 1;
    this.zooming = 1;
    this.transformOrigin = '0 0';
    this.zoomCenter = [];
    this.currentDeleteBtn = '';
    this._touchCanvas = false;
    this._maxDiffTime = 50;
    this._lastMoveNodeTime = 0;
    this._currentMoveNodeTime = 0;
  }

  onStart(e) {
    this._touchCanvas = true;
    let tmp = e.target;
    if ((tmp.classList.contains('editer-canvas') || tmp.tagName == 'svg') && this._fingers(e) == 1) {
      this.draggingObject = document.querySelector('.editer-surface-canvas');
      this.baseTop = parseInt(this.draggingObject.style.top) || 0;
      this.baseLeft = parseInt(this.draggingObject.style.left) || 0;
      this.willPan = true;
      this.willZoom = false;

      this.touchX = this._touches(e)[0].pageX;
      this.touchY = this._touches(e)[0].pageY;
    } else if(tmp.tagName == 'path' && this._fingers(e) == 1) {  // if touch target is the path
      this.currentDeleteBtn = tmp.closest('svg').querySelector('.deleteBtn');// show or hide delete wire button
      let deleteBtns = document.querySelectorAll('.deleteBtn');
      for(let i=0; i<deleteBtns.length; i++){
        if(deleteBtns[i]!=this.currentDeleteBtn){
          deleteBtns[i].classList.add('hide');
        }
      }

      this.currentDeleteBtn.classList.toggle('hide');

    } else if(tmp.className == 'deleteBtn' && this._fingers(e) == 1){
      let deleteWire = tmp.closest('svg');
      deleteWire.remove();
      tmp.parentNode.remove();
      UIActions.removeWires(deleteWire.id);
    } else if(this._fingers(e) == 2) {
      console.log('zoomming');
      this.draggingObject = document.querySelector('.editer-surface-canvas');
      this.willPan = false;
      // close multi touch for some issues.
      // this.willZoom = true;
      this.willZoom = false;
      this.initDist = this._distance(this._touches(e));
      let scale = this.draggingObject.style.transform;
      this.baseZoom = parseFloat(scale.substring(6, scale.length - 1));
      this.zoomCenter = this._getCenter(this._touches(e));
      let obj = {
        left: this.baseLeft,
        top: this.baseTop,
        zoom: this.baseZoom
      };
      this.baseXY = this._getPosition(this.zoomCenter, obj);
      this._showDeleteTips('electronic', false);
      this._showDeleteTips('notElectronic', false);
    } else {
      this._touchCanvas = false;
      this._showDeleteTips('electronic', false);
      this._showDeleteTips('notElectronic', false);
    }

    if(this._touchCanvas) {
      this.container.emitter.emit('startTouchCanvas');
    }

  }

  onMove(e) {
    if(!this._touchCanvas) {
      return;
    }
    if (this.willPan) {
      this._currentMoveNodeTime = new Date().getTime();
      let diffTime = this._currentMoveNodeTime - this._lastMoveNodeTime;
      if(diffTime <= this._maxDiffTime) {
        return;
      }
      this._lastMoveNodeTime = this._currentMoveNodeTime;
      let deltaX = this._touches(e)[0].pageX - this.touchX;
      let deltaY = this._touches(e)[0].pageY - this.touchY;
      this.draggingObject.style.top = this.baseTop + deltaY + 'px';
      this.draggingObject.style.left = this.baseLeft + deltaX + 'px';
    } else if (this.willZoom) {
      let dist = this._distance(this._touches(e));
      this.ratio = dist / this.initDist;
      if (Math.abs(this.ratio - 1) < 0.1) {
        return;
      }
      this.zooming = this.baseZoom * this.ratio;
      if(this.zooming >= 2) {
        this.zooming = 2;
        return;
      }
      if(this.zooming <= 0.5) {
        this.zooming = 0.5;
        return;
      }
      this.draggingObject.style.transform = 'scale(' + (this.zooming) + ')';
      this.draggingObject.style.top = this.baseTop + this.baseXY[1] * this.baseZoom * (1 - this.ratio) + 'px';
      this.draggingObject.style.left = this.baseLeft + this.baseXY[0] * this.baseZoom * (1 - this.ratio) + 'px';
      this.draggingObject.style.transformOrigin = this.transformOrigin;
    }
  }

  onEnd() {
    if(!this._touchCanvas) {
      return;
    }
    if (this.willPan) {
      this.willPan = false;
      let deleteBtnArray = document.querySelectorAll('.deleteBtn');
      for(let i=0; i<deleteBtnArray.length; i++){
        if(deleteBtnArray[i].classList.contains('hide') == false){
          deleteBtnArray[i].classList.add('hide');
        }
      }
      this.container.emitter.emit('pan', {
        left: parseInt(this.draggingObject.style.left),
        top: parseInt(this.draggingObject.style.top),
      });
    } else if (this.willZoom) {
      this.willZoom = false;
      this.container.emitter.emit('zoom', {
        ratio: parseFloat(this.zooming),
        left: parseInt(this.draggingObject.style.left),
        top: parseInt(this.draggingObject.style.top),
        transformOrigin: this.transformOrigin
      });
    }
  }

}

export {CanvasTouchHandler, NodeTouchHandler, PortTouchHandler};