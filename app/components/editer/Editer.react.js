import React, { Component } from 'react';
import { Canvas } from './Canvas.react';
import { Palette } from './Palette.react.js';
import { SubPalette } from './SubPalette.react.js';
import { CloudApp } from './CloudApp.react.js';
import { Shelf } from './Shelf.react.js';
import { MusicBoardKey } from './MusicBoardKey.react';
import { EventEmitter } from 'fbemitter';
import { EditTextBox } from './EditTextBox.react.js';
import {UpdateFirmware} from './UpdateFirmware.react';
import nodeStore from '../../stores/nodeStore';
require('./editer.less');
require('./editer.mobile.less');

class Editer extends Component {
  constructor() {
    super();

    this.emitter = new EventEmitter();
  }

  render() {
    return (
    <div className="editer-main">
        <Canvas emitter={this.emitter} projectId={this.props.projectId}/>
        <Palette nodeTypes={nodeStore.getNodeTypes()}  emitter={this.emitter}/>
        <SubPalette nodeTypes={nodeStore.getNodeTypes()}  emitter={this.emitter}/>
        <Shelf nodeTypes={nodeStore.getNodeTypes()} emitter={this.emitter} projectId={this.props.projectId}/>
        <CloudApp emitter={this.emitter}/>
        <EditTextBox emitter={this.emitter} />
        <MusicBoardKey emitter={this.emitter}/>
        <UpdateFirmware emitter={this.emitter}/>
    </div>
    );
  }
}

export { Editer };