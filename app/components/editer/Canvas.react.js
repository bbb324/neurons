import React, { Component } from 'react';
import nodeFactory from '../nodes/nodeFactory.js';
import { NodeTouchHandler, PortTouchHandler, CanvasTouchHandler } from './CanvasTouches';
import { WireUtils } from './WireUtils';
import { AudioUtils } from './AudioUtils';
import { TouchHandler } from './TouchHandler';
import tapOrClick from 'react-tap-or-click';
import UIActions from '../../actions/UIActions';
import nodeStore from '../../stores/nodeStore';
import editerStore from '../../stores/editerStore';
import LinkStore from '../../stores/LinkStore';
import projectStore from '../../stores/projectStore';
import engine from '../../core/FlowEngine';
import { screenshot } from '../../utils/Html2CanvasTool';
import { parseValue } from '../../utils/dom';
import { Link } from 'react-router';

class Canvas extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      zoom: 1,
      top: 0,
      left: 0,
      transformOrigin: '0 0',
      wires: [],
      nodes: [],
      showCloudAppEntrance: false
    };
    this.TouchHandler = new TouchHandler();
    this.touchHandlers = [
      new NodeTouchHandler(this),
      new PortTouchHandler(this),
      new CanvasTouchHandler(this)
    ];

    this.emitter = this.props.emitter;
    this.nodeTypes = nodeStore.getNodeTypes();
  }

  drawNodes() {
    let self = this;
    let nodes = this.state.nodes.map(function (value) {
      let Node = nodeFactory[value.type];
      let info = self.nodeTypes[value.type];

      return (
        <Node info={info} type={info.name}
          top={value.top} left={value.left}
          id={value.id} key={value.id} emitter={self.emitter}/>
      );
    });
    return nodes;
  }

  render() {
    return (
      <div>
        <Link to="/" className='home'><div className='back-to-entrance'><img src='img/icon-back.png' /></div></Link>
        <div className="editer-canvas" id="editer-canvas-absolute"
             style={{ background: '#EBEBEB url("img/icon-canvas-bg.png")' }}
             onTouchStart={this.touchStart.bind(this)}
             onTouchMove={this.touchMove.bind(this)}
             onTouchEnd={this.touchEnd.bind(this)} ref='editerCanvas'>
          <div className={'cloud-entrance ' + (this.state.showCloudAppEntrance == true ? 'show-cloud-entrance' : '')} {...tapOrClick(this.openCloudApp.bind(this)) }>
            <img className='icon-cloud-entrance' src='img/icon-cloud-app.png' />
          </div>
          <div className={'magnifier ' + (this.state.showCloudAppEntrance == true ? 'adjust-magnifer-position' : '')} {...tapOrClick(this.magnifiy.bind(this)) } ref='magnifer'>
            <img className='icon-magnifier' src='img/icon-zoom-out.png' />
          </div>
          <div className="editer-surface-canvas" ref='canvas' style={{
            left: this.state.left + 'px',
            top: this.state.top + 'px',
            transform: 'scale(' + this.state.zoom + ')',
            transformOrigin: this.state.transformOrigin,
          }}>
            {this.drawNodes()}
            <svg ref='fakewire' className="editer-wire editer-fake-wire">
              <path className='path-inner'></path>
              <path className='path-cover'></path>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  magnifiy(e) {
    let target = e.currentTarget;
    let img = target.querySelector('img');

    // adjust width and height in lanscape mobile devices.
    let screenWidth = Math.max(screen.width, screen.height);
    let screenHeight = Math.min(screen.width, screen.height);

    let baseXY = this.TouchHandler._getPosition([screenWidth / 2, screenHeight / 2], {
      top: this.state.top,
      left: this.state.left,
      zoom: this.state.zoom
    });

    let scale;
    if (target.classList.contains('turn')) {
      target.classList.remove('turn');
      setTimeout(() => {
        img.src = 'img/icon-zoom-out.png';
      }, 50);
      scale = 1;
    } else {
      target.classList.add('turn');
      setTimeout(() => {
        img.src = 'img/icon-zoom-in.png';
        img.style.transform = 'rotateY(360)';
      }, 50);
      scale = 0.5;
    }

    this.setState({
      top: this.state.top + baseXY[1] * (this.state.zoom - scale),
      left: this.state.left + baseXY[0] * (this.state.zoom - scale),
      zoom: scale,
    });

    setTimeout(() => {
      UIActions.setSubNodesPosition(scale);
    },0);
  }

  touchStart(e) {
    this.touchHandlers.forEach((handler) => {
      handler.onStart(e);
    });
  }

  touchMove(e) {
    this.touchHandlers.forEach((handler) => {
      handler.onMove(e);
    });
  }

  touchEnd(e) {
    e.preventDefault();
    this.touchHandlers.forEach((handler) => {
      handler.onEnd(e);
    });
  }

  openProject(id) {
    UIActions.openProject(id);
  }
  createProject() {
    UIActions.createProject();
  }

  _getPortCenter(ele) {
    let info = ele.getBoundingClientRect();
    let x = parseFloat(info.left + info.width / 2);
    let y = parseFloat(info.top + info.height / 2);
    return [x, y];
  }

  openCloudApp() {
    let cloudNodeList = [];
    this.state.nodes.forEach((node) => {
      let categoryArray = node.category.split(',');
      categoryArray.forEach((unit) => {
        if (unit == 'control') {
          cloudNodeList.push(node);
        }
      });
    });
    this.emitter.emit('openCloudApp', cloudNodeList);

    if (window._runtime == 'cordova') {
      window.ga.trackEvent('openControlPanel');
    }
  }

  loadProject() {
    let self = this;
    let i;
    let nodes = projectStore.getCurrentProjectData().editer['nodes'];
    //step1: setUsed,set default setting for electronic
    for (i = 0; i < nodes.length; i++) {
      if (nodes[i].category == 'electronic') {
        nodeStore.setUsed(nodes[i].id);
      }
    }
    //step2: config
    this.setState({
      nodes: nodes,
      wires: projectStore.getCurrentProjectData().editer['wires'],
    });
    //step3: ininNode,this will update input and outout
    for (i = 0; i < nodes.length; i++) {
      nodeStore.initNode(nodes[i].id);
    }

    //setMicroNodes
    UIActions.setMicroNodeKey();

    editerStore.insertDate(this.state.nodes, this.state.wires);
    let wires = self.state.wires;
    if (nodes.length != 0) {
      for (i = 0; i < wires.length; i++) {
        let s = wires[i].split('&');
        let start = this._getPortCenter(document.getElementById(s[1]));
        let end = this._getPortCenter(document.getElementById(s[3]));
        let newSvg = WireUtils.createSvg(wires[i]);
        WireUtils.drawWire(start[0], start[1], end[0], end[1], newSvg);
        document.getElementsByClassName('editer-surface-canvas')[0].appendChild(newSvg);
      }
    }
    if (this.state.nodes.length != 0) {
      this.state.nodes.forEach((node) => {
        let categoryArray = node.category.split(',');
        categoryArray.forEach((unit) => {
          if (unit == 'control') {
            this.setState({
              showCloudAppEntrance: true
            });
          }
        });
      });
    }
  }

  removeWires(removeWires) {
    let self = this;
    if (removeWires) {
      for (let i = 0; i < removeWires.length; i++) {
        if (document.getElementById(removeWires[i]) != undefined) {
          document.getElementById(removeWires[i]).remove();
        }

      }
    }
    self.setState({
      nodes: editerStore.get().nodes,
      wires: editerStore.get().wires,
    });
  }

  playAudio() {
    let self = this;
    AudioUtils.play(AudioUtils.DISCONNECT);
    self.setState({
      wires: editerStore.get().wires,
    });
  }

  nodeOutputChange(bundle) {
    let wires = WireUtils.findWiresBySource(bundle.id, bundle.port);
    for (let i = 0; i < wires.length; i++) {
      if (bundle.value) {
        WireUtils.highlightWire(wires[i]);
      } else {
        WireUtils.highlightWire(wires[i], true);
      }
    }
    // show value on output port if neccessary
    //setTimeout is to resolve buzzer`s assistNode musicNotes has noValue
    setTimeout(() => {
      let item = document.getElementById(bundle.id);
      if (item) {
        let valueTxt = item.querySelectorAll('.node-port-output .core .node-port-value');
        for (let i = 0; i < valueTxt.length; i++) {
          if (valueTxt[i].closest('.node-port-output').id.split('-')[1] == bundle.port) {
            if (typeof bundle.value == 'boolean') {
              this.clearPrevStyle(valueTxt[i]);
              this.showBooleanStyle(valueTxt[i], bundle.value);
            } else if (typeof bundle.value == 'number' && isNaN(bundle.value)) {
              this.clearPrevStyle(valueTxt[i]);
              valueTxt[i].innerHTML = '<img style="object-fit: scale-down; display: block; width: 100%; height: 100%; margin: 0 auto;" src="img/icon-isNaN.png"/>';
            } else if (typeof bundle.value == 'number') {
              this.clearPrevStyle(valueTxt[i]);
              valueTxt[i].textContent = parseValue(bundle);
            } else if (typeof bundle.value == 'string' || typeof bundle.value == 'object') {
              this.clearPrevStyle(valueTxt[i]);
              this.showObjectStyle(valueTxt[i]);
            }
          }
        }
      }
    },0);
  }

  clearPrevStyle(ele) {
    let core = ele.closest('.core');
    core.closest('.node-port-outputs').style.marginLeft = '';
    core.style.width = '';
    core.style.height = '';
    ele.style.width = '';
    ele.style.height = '';
    ele.style.background = '';
    ele.style.borderRadius = '';
  }

  showObjectStyle(ele) {
    let core = ele.closest('.core');
    core.style.width = window.innerWidth > 767 ? '16px' : '10px';  // if phone, using 10px
    core.style.height = window.innerWidth > 767 ? '16px' : '10px';
    core.closest('.node-port-outputs').style.marginLeft = '0';
    ele.style.width = window.innerWidth > 767 ? '10px' : '6px';  // if phone, using 6px
    ele.style.height = window.innerWidth > 767 ? '10px' : '6px';
    ele.style.background = '#FFFFFF';
    ele.style.borderRadius = '100%';
  }

  showBooleanStyle(ele, flag) {
    let core = ele.closest('.core');
    ele.textContent = flag == true ? 'Y' : 'N';
    ele.closest('.node-port-outputs').style.marginLeft = 0;

    core.style.width = window.innerWidth > 767 ? '16px' : '10px';
    core.style.height = window.innerWidth > 767 ? '16px' : '10px';
    ele.style.background = 'transparent';
    ele.style.borderRadius = '0';
  }

  nodeInputChange(bundle) {
    // show value on input port if neccessary
    let item = document.getElementById(bundle.id);
    if (item) {
      let valueTxt = item.querySelectorAll('.node-port-input .core.show .node-port-value');
      for (let i = 0; i < valueTxt.length; i++) {
        if (valueTxt[i].closest('.node-port-input').id.split('-')[1] == bundle.port) {
          if (typeof bundle.value == 'boolean') {
            valueTxt[i].textContent = bundle.value == true ? 1 : 0;
          } else if (typeof bundle.value == 'object') {
            valueTxt[i].textContent = '';
          } else {
            valueTxt[i].textContent = parseValue(bundle);
          }
        }
      }
    }
  }

  removeControlNode() {
    let hasCloudNode = false;
    let nodes = editerStore.get().nodes;
    if (nodes.length == 0) {
      hasCloudNode = false;
      this.setState({
        showCloudAppEntrance: hasCloudNode
      });
    } else {
      nodes.forEach((node) => {
        let categoryArray = node.category.split(',');
        categoryArray.forEach((unit) => {
          if (unit == 'control') {
            hasCloudNode = true;
            this.setState({
              showCloudAppEntrance: hasCloudNode
            });
            return;
          }
        });
      });
      this.setState({
        showCloudAppEntrance: hasCloudNode
      });
    }
  }

  disconnect() {
    if (LinkStore.getStatus() == 'connected') {
      UIActions.disconnectLinkDevice(false);
    }
    history.back(-1);
  }

  componentDidUpdate() {
    let canvasStatus = {
      left: this.state.left,
      top: this.state.top,
      zoom: this.state.zoom
    };
    UIActions.saveCanvasStatus(canvasStatus);
  }

  componentDidMount() {
    let self = this;
    this.loadProjectFunc = this.loadProject.bind(this);
    this.removeWiresFunc = this.removeWires.bind(this);
    this.playAudioFunc = this.playAudio.bind(this);
    this.nodeOutputChangeFunc = this.nodeOutputChange.bind(this);
    this.nodeInputChangeFunc = this.nodeInputChange.bind(this);
    this.removeControlNodeFunc = this.removeControlNode.bind(this);
    this.disconnectFunc = this.disconnect.bind(this);
    if (self.props.projectId == 'create') {
      this.createProject();
    } else {
      this.openProject(self.props.projectId);
    }
    projectStore.on('projectChange', this.loadProjectFunc);

    editerStore.on('removeNode', this.removeWiresFunc);

    editerStore.on('removeSingleWire', this.playAudioFunc);

    nodeStore.on('NodeOutputChange', this.nodeOutputChangeFunc);
    nodeStore.on('NodeInputChange', this.nodeInputChangeFunc);
    nodeStore.on('removeControlNode', this.removeControlNodeFunc);
    document.addEventListener('backbutton', this.disconnectFunc, false);

    this.emitter.addListener('addNode', (nodeInfo) => {
      console.log(nodeInfo);
      let obj = {
        left: this.state.left,
        top: this.state.top,
        zoom: this.state.zoom,
      };
      let xy = this.touchHandlers[0]._getPosition([nodeInfo.left, nodeInfo.top], obj);
      let actionInfo = {
        left: xy[0],
        top: xy[1],
        type: nodeInfo.type,
        category: nodeInfo.category
      };
      let hasCloudNode = false;
      if (nodeInfo.id) {
        // elec nodes
        UIActions.useNode(nodeInfo.id);
        actionInfo.id = nodeInfo.id;
      }
      UIActions.addNode(actionInfo);

      editerStore.get().nodes.forEach((node) => {
        let categoryArray = node.category.split(',');
        categoryArray.forEach((unit) => {
          if (unit == 'control') {
            return hasCloudNode = true;
          }
        });
      });

      self.setState({
        nodes: editerStore.get().nodes,
        showCloudAppEntrance: hasCloudNode
      });
    });

    this.emitter.addListener('longpressNode', (nodeInfo) => {
      UIActions.longpressNode(nodeInfo.id);
    });

    this.emitter.addListener('beginMovingNodeToCanvas', () => {
      UIActions.beginMovingNodeToCanvas();
    });

    this.emitter.addListener('moveNode', (nodeInfo) => {
      self.setState({
        nodes: editerStore.get().nodes,
        wires: editerStore.get().wires,
      });
      UIActions.moveNode({
        left: nodeInfo.left,
        top: nodeInfo.top,
        id: nodeInfo.id
      });
    });

    this.emitter.addListener('deleteNode', (nodeInfo) => {
      let hasCloudNode = false;
      if (nodeInfo.category == 'electronic') {
        UIActions.unUseNode(nodeInfo.id);
      } else {
        UIActions.removeNode(nodeInfo.id);

      }
      UIActions.showShelfDelete(false);
      UIActions.showPaletteDelete(false);
      let nodes = editerStore.get().nodes;
      if (editerStore.get().nodes.length == 0) {
        hasCloudNode = false;
      } else {
        nodes.forEach((node) => {
          let categoryArray = node.category.split(',');
          categoryArray.forEach((unit) => {
            if (unit == 'control') {
              hasCloudNode = true;
              return;
            }
          });
        });
      }

      this.setState({
        showCloudAppEntrance: hasCloudNode
      });


    });

    this.emitter.addListener('showDelete', (nodeInfo) => {
      if (nodeInfo.category == 'electronic') {
        UIActions.showShelfDelete(nodeInfo.showDelete);
      } else {
        UIActions.showPaletteDelete(nodeInfo.showDelete);
      }
    });

    this.emitter.addListener('addWire', (wireInfo) => {
      AudioUtils.play(AudioUtils.CONNECT);
      self.setState({
        wires: editerStore.get().wires,
      });
      UIActions.addWire(wireInfo.wire);
    });

    this.emitter.addListener('pan', (panInfo) => {
      console.log('to pan');
      UIActions.globalCanvasTouch();
      this.setState({
        left: panInfo.left,
        top: panInfo.top
      });
    });

    this.emitter.addListener('startTouchCanvas', ()=>{
      UIActions.startTouchCanvas();
    });

    this.emitter.addListener('zoom', (zoomInfo) => {
      this.setState({
        left: zoomInfo.left,
        top: zoomInfo.top,
        zoom: zoomInfo.ratio,
        transformOrigin: zoomInfo.transformOrigin
      });
    });
  }

  componentWillUnmount() {
    editerStore.clearDate();
    projectStore.off('projectChange', this.loadProjectFunc);
    editerStore.off('removeNode', this.removeWiresFunc);
    editerStore.off('removeSingleWire', this.playAudioFunc);
    nodeStore.off('NodeOutputChange', this.nodeOutPutChangeFunc);
    nodeStore.off('removeControlNode', this.removeControlNodeFunc);
    nodeStore.off('NodeInputChange', this.nodeInputChangeFunc);

    this.emitter.removeAllListeners();
    let editerDiv = this.refs.editerCanvas;
    let magnifer = this.refs.magnifer;
    if (editerDiv != null) {
      editerDiv.style.background = 'none';
      magnifer.style.display = 'none';
      this.cloudNodes = engine.getActiveCloudNodes();
      this.cloudNodes.forEach((node) => {
        if (node.type == 'LINE_GRAPH') {
          document.getElementById(node.id).querySelector('.node-actual-content').innerHTML = '<img class="chart-fake" src="./img/icon-chart.png"/>';
        }
      });
      projectStore.setSaveProject(false);
      screenshot(editerDiv, this.projectBase64.bind(this));
    }
  }
  projectBase64(baseImg) {
    UIActions.saveProject(projectStore.getCurrentProjectId(), this.state, this.cloudNodes.length == 0 ? null : this.cloudNodes, baseImg);
    document.removeEventListener('backbutton', this.disconnectFunc, false);
  }
}

export { Canvas };