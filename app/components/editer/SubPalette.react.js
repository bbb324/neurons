import React, {PureComponent } from 'react';
import UIActions from '../../actions/UIActions';
import nodeFactory from '../nodes/nodeFactory.js';
import { TouchHandler } from '../editer/TouchHandler';
import { WireUtils } from '../editer/WireUtils';
import editerStore from '../../stores/editerStore';
import commonStore from '../../stores/commonStore';
import projectStore from '../../stores/projectStore';
import AppDispatcher from '../../dispatcher/AppDispatcher';
import AppConstants from '../../constants/AppConstants';
import '../nodes/SubPalette.less';

class NodeTouchHandler extends TouchHandler {
  constructor() {
    super(...arguments);
    this.canMove = false;
    this.draggingObject = null;
    this._canMoveEvent = false;
  }

  onStart(e) {
    if (e.target.closest('.node-preview') && e.touches.length == 1) {
      let tmp = e.target.closest('.node-preview');
      this.canMove = true;
      this._canMoveEvent = false;
      this.baseTop = this._getOffsetRect(tmp).top - parseInt(window.getComputedStyle(tmp).marginTop);
      this.baseLeft = this._getOffsetRect(tmp).left - parseInt(window.getComputedStyle(tmp).marginLeft);
      this.draggingObject = tmp.cloneNode(true);
      this.draggingObject.style.position = 'absolute';
      this.draggingObject.classList.add('sub-palette-fake-node');
      this.draggingObject.querySelector('.node-preview-name').remove();
      this.draggingObject.style.top = this.baseTop + 'px';
      this.draggingObject.style.left = this.baseLeft + 'px';
      this.touchX = this._touches(e)[0].pageX;
      this.touchY = this._touches(e)[0].pageY;
      document.querySelector('.editer-main').appendChild(this.draggingObject);
      //remove sub-node-shelf
      tmp.closest('.sub-node-shelf').classList.add('hide');
      this.container.setState({
        isActive: false
      });
    }
  }

  onMove(e) {
    if (this.canMove) {
      let deltaX = this._touches(e)[0].pageX - this.touchX;
      let deltaY = this._touches(e)[0].pageY - this.touchY;
      this.draggingObject.style.top = this.baseTop + deltaY + 'px';
      this.draggingObject.style.left = this.baseLeft + deltaX + 'px';
      if (!this._canMoveEvent) {
        this._canMoveEvent = true;
        this.container.emitter.emit('beginMovingNodeToCanvas');
      }
    }
  }

  onEnd() {
    if (this.canMove) {
      this.canMove = false;
      if (this.draggingObject) {
        this.draggingObject.remove();
      }
      //var elem = document.elementFromPoint(this._touches(e)[0].pageX, this._touches(e)[0].pageY);
      let nodeInfo = {
        left: parseInt(this.draggingObject.style.left),
        top: parseInt(this.draggingObject.style.top),
        ins: [],
        outs: [],
        type: this.draggingObject.dataset.type,
        category: this.draggingObject.dataset.category,
        isAddAssistNode: true
      };
      this.container.emitter.emit('addNode', nodeInfo);

      setTimeout(() => {
        this._autoDrawRealLine();
      }, 10);

      if (window._runtime == 'cordova') {
        window.ga.trackEvent('createNode', this.draggingObject.dataset.category + '-' +this.draggingObject.dataset.type);
      }

    }
  }

  _autoDrawRealLine() {
    // sourceNodeid&sourcePortId&targetNodeId&targetPortId
    let lineInfo = this._getLineInfo();
    console.log('[lineInfo]', lineInfo);
    let wire = lineInfo.outNodeId + '&' + lineInfo.outPortId + '&' + lineInfo.inNodeId + '&' + lineInfo.inPortId;
    if(this.container.state.wires.indexOf(wire) !== -1) {
      return;
    }
    let newSvg = WireUtils.createSvg(wire);
    WireUtils.setWireInfo(newSvg, lineInfo.outNodeId, lineInfo.outPortId, lineInfo.inNodeId, lineInfo.inPortId);
    WireUtils.drawWire(lineInfo.outStartX, lineInfo.outStartY, lineInfo.inEndX, lineInfo.inEndY, newSvg);
    document.querySelector('.editer-surface-canvas').appendChild(newSvg);
    this.container.emitter.emit('addWire', {wire: wire});

    //openConfiguratorWithSelfNode
    UIActions.openConfiguratorWithSubNode(editerStore.addNodeId);
  }

  _getLineInfo() {
    let outNodeId, outPortId, outStartX, outStartY, inNodeId, inPortId, inEndX, inEndY;
    if(this.container.relativePosition === 'left') {
      outNodeId = editerStore.addNodeId;
      inNodeId = this.container.state.parentId;
    }else {
      outNodeId = this.container.state.parentId;
      inNodeId = editerStore.addNodeId;
    }
    let outPortDom = document.getElementById(outNodeId).querySelectorAll('.node-port-output')[0];
    let inPortDom = document.getElementById(inNodeId).querySelectorAll('.node-port-input')[0];
    if(outPortDom && inPortDom) {
      outPortId = outPortDom.id;
      inPortId = inPortDom.id;
      let positionObj = commonStore.getCanvasStatus();
      let outStart = this._getPortCenter(outPortDom, positionObj);
      outStartX = outStart[0];
      outStartY = outStart[1];
      let inEnd = this._getPortCenter(inPortDom, positionObj);
      inEndX = inEnd[0];
      inEndY = inEnd[1];
      return {
        outNodeId,
        outPortId,
        outStartX,
        outStartY,
        inNodeId,
        inPortId,
        inEndX,
        inEndY
      };
    }
  }

  onCancel() {
    this.draggingObject.remove();
  }
}

class SubPalette extends PureComponent {

  constructor() {
    super(...arguments);
    console.log('props', this.props);
    this.emitter = this.props.emitter;
    this.relativePosition = '';
    this.touchHandler = new NodeTouchHandler(this);
    this.state = {
      category: null,
      parentId: null,
      wires: projectStore.getCurrentProjectData().editer['wires'],
      isActive: false,
      zoom: 1
    };

    this.getRelativePosition = this.getRelativePosition.bind(this);
    this.getOffsetRect = this.getOffsetRect.bind(this);
  }

  //subNodes can be left or right position  by node
  getRelativePosition(type) {
    switch (type) {
    case 'OLED_DISPLAY':
    case 'BUZZER':
    case 'LED':
    case 'LEDPANEL':
    case 'LEDSTRIP':
    case 'MOTORS':
    case 'SERVO':
    case 'SMARTSERVO':
      return 'left';
    case 'SNAPSHOT':
    case 'COLORSENSOR':
    case 'VOISERECOGNITION':
    case 'RECORD':
    case 'SPEAKERRECOGNIZE':
    case 'OCR':
      return 'right';
    default:
      return 'left';
    }
  }

  getOffsetRect() {
    if(this.state.parentId) {
      let left = '', top = '', translate = '';
      let canvasRect = commonStore.getCanvasStatus();
      let nodeDomRect = window.getComputedStyle(document.getElementById(this.state.parentId));
      if(this.relativePosition === 'left') {
        if(this.state.zoom === 0.5) {
          //自身元素缩小，所以左偏移量为100% - 缩小比例的一半
          translate = 'translate(-75%, -50%) scale(0.5)';
          left = canvasRect.left + Number(nodeDomRect.left.slice(0,-2))/2 -5;
        }else {
          translate = 'translate(-100%, -50%)';
          left = canvasRect.left + Number(nodeDomRect.left.slice(0,-2)) - 10;
        }
      }else {
        if(this.state.zoom === 0.5) {
          //自身元素缩小，所以左偏移量为缩小比例的一半
          left = canvasRect.left + Number(nodeDomRect.left.slice(0,-2))/2 + Number(nodeDomRect.width.slice(0,-2))/2 + 5;
          translate = 'translate(-25%, -50%) scale(0.5)';
        }else {
          left = canvasRect.left + Number(nodeDomRect.left.slice(0,-2)) + Number(nodeDomRect.width.slice(0,-2)) + 10;
          translate = 'translate(0, -50%)';
        }

      }

      //set Top
      if(this.state.zoom === 0.5) {
        top = canvasRect.top + Number(nodeDomRect.top.slice(0,-2))/2 + Number(nodeDomRect.height.slice(0,-2))/4;
      }else {
        top = canvasRect.top + Number(nodeDomRect.top.slice(0,-2)) + Number(nodeDomRect.height.slice(0,-2))/2;
      }

      return {
        left: left + 'px',
        top: top + 'px',
        transform: translate
      };
    }

  }

  onStart(e) {
    e.preventDefault();
    this.touchHandler.onStart(e);

  }

  onMove(e) {
    e.preventDefault();
    this.touchHandler.onMove(e);
  }

  onEnd(e) {
    e.preventDefault();
    this.touchHandler.onEnd(e);
  }

  onCancel(e) {
    e.preventDefault();
    this.touchHandler.onCancel(e);
  }

  renderSubNodes() {
    let nodes = [];
    for(let type in this.props.nodeTypes){
      // use to support multi categories, like 'sound,cloud,common'
      let categoryStr = this.props.nodeTypes[type].props.category.split(',');
      for(let i=0; i<categoryStr.length; i++) {
        if(categoryStr[i] == this.state.category && nodeFactory[type]) {
          let Node = nodeFactory[type];
          nodes.push(
            <Node isPreview={true} info={this.props.nodeTypes[type]} key={type}/>
          );
        }
      }
    }
    return nodes;
  }

  render() {
    return (
      <div className={'sub-node-shelf ' + (this.state.isActive==true?'':'hide')} ref='paletteTab'
           style={this.getOffsetRect()}
           onTouchStart={this.onStart.bind(this)}
           onTouchMove={this.onMove.bind(this)}
           onTouchEnd={this.onEnd.bind(this)}
           onTouchCancel={this.onCancel.bind(this)}>
        {this.renderSubNodes()}
      </div>
    );
  }

  togglePalette() {
    let activeInfo = editerStore.getConfigureNode();
    console.log(activeInfo);
    if(activeInfo && this.props.nodeTypes[activeInfo.type].props && this.props.nodeTypes[activeInfo.type].props.hasassistanceNode === true) {
      for (let nodeType in this.props.nodeTypes) {
        // use to support multi categories, like 'sound,cloud,common'
        let categoryStr = this.props.nodeTypes[nodeType].props.category.split(',');
        for(let i=0; i<categoryStr.length; i++) {
          if(categoryStr[i] === activeInfo.type) {
            this.relativePosition = this.getRelativePosition(activeInfo.type);
            let zoom = document.querySelector('.editer-main .magnifier').classList.contains('turn') ? 0.5 : 1;
            this.setState({
              category: activeInfo.type,
              isActive: true,
              parentId: activeInfo.id,
              zoom: zoom
            });
            break;
          }
        }
      }
    } else {
      this.setState({
        isActive: false,
        parentId: null
      });
    }
  }

  componentDidMount() {
    this.refs.paletteTab.classList.add('hide');
    this.toggleConfigFunc = this.togglePalette.bind(this);
    editerStore.on('activateNode', this.toggleConfigFunc);
    this._register = AppDispatcher.register((action) => {
      if (action.actionType === AppConstants.GLOBAL_CANVAS_TOUCH) {
        this.setState({
          isActive: false
        });
      } else if(action.actionType === AppConstants.SET_SUBNODES_POSITION) {
        this.setState({
          zoom: action.zoom
        });
      } else if(action.actionType == AppConstants.START_TOUCH_CANVAS) {
        this.setState({
          isActive: false
        });
      }
    });
  }

  componentWillUnmount() {
    editerStore.off('activateNode', this.toggleConfigFunc);
    AppDispatcher.unregister(this._register);
  }
}

export {SubPalette};