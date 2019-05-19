/**
 * Created by razr on 2016/10/11.
 */
import React, { Component } from 'react';
import AppDispatcher from '../../dispatcher/AppDispatcher';
import AppConstants from '../../constants/AppConstants';
import Modal from 'react-modal';
import tapOrClick from 'react-tap-or-click';
import { DialogColorList } from '../configurator/ColorPanel.react';
import languages from '../../languages';
import Immutable from 'immutable';
import './ImageDialog.less';

const DEFAULT_COLOR = 1;
const MAX_HISTORY = 5;
const COLOR_LIST = ['#000000', '#ff0000', '#ffaf00', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#d400ff', '#ffffff'];
const EMPTY_IMAGE = [
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0
];
const DEFAULT_IMAGES = [
  [
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0
  ]
];

const EXAMPLE_IMAGES = [
  // happy
  [
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 4, 0, 0, 0, 0, 4, 0,
    4, 0, 4, 0, 0, 4, 0, 4,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 4, 0, 0, 0, 0, 4, 0,
    0, 0, 4, 4, 4, 4, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0
  ],
  // sad
  [
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    2, 2, 2, 0, 0, 2, 2, 2,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 2, 2, 2, 2, 0, 0,
    0, 2, 0, 0, 0, 0, 2, 0,
    0, 0, 0, 0, 0, 0, 0, 0
  ],
  // angry
  [
    0, 0, 0, 0, 0, 0, 0, 0,
    1, 0, 0, 0, 0, 0, 0, 1,
    0, 1, 1, 0, 0, 1, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 1, 1, 0, 0,
    0, 0, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0
  ],
  // heart
  [
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 1, 0, 0, 1, 1, 0,
    1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1,
    0, 1, 1, 1, 1, 1, 1, 0,
    0, 0, 1, 1, 1, 1, 0, 0,
    0, 0, 0, 1, 1, 0, 0, 0
  ]
];

class History {
  constructor(maxLength) {
    this.maxLength = maxLength;
    this.records = new Array(maxLength);
    this.reset();
  }

  reset() {
    for( let i=0; i<this.maxLength; i++) {
      this.records[i] = null;
    }
    this.current = -1;
  }

  record(state) {
    if(this.current == this.maxLength - 1) {
      this.records.shift();
    } else {
      this.current++;
    }
    this.records[this.current] = state;
  }

  undo() {
    if(this.current > 0) {
      return this.records[--this.current];
    } else {
      return null;
    }
  }

  redo() {
    if(this.current < this.maxLength-1 && this.records[this.current] !== null) {
      return this.records[++this.current];
    } else {
      return null;
    }
  }
}

class Ledimage extends Component {
  constructor() {
    super();
  }
  renderCells(options) {
    let image = this.props.image || [];
    let cells = [];
    for(let i=0; i<image.length; i++) {
      cells.push(
        <li
          key={i} data-idx={i} className="led-image-cell"
          style={{
            background: COLOR_LIST[image[i]], 
            width: options.cellWidth, 
            height: options.cellWidth, 
            borderRadius: options.cellRadius
          }}
          ></li>
      );
    }
    return cells;
  }
  onSelect(e) {
    this.props.onSelect && this.props.onSelect(e);
  }
  onTouch(e) {
    if(this.props.readonly) {
      return;
    }
    let location = e.changedTouches[0];
    let target = document.elementFromPoint(location.clientX, location.clientY);
    let idx = target.dataset.idx;
    this.props.onDrawPoint && this.props.onDrawPoint(idx);
  }
  render() {
    let options = {};
    let width = this.props.width;
    options.cellWidth = (width - 8)/8;
    options.cellRadius = width/30;
    return (
      <ul {...tapOrClick(this.onSelect.bind(this))}
        data-index={this.props.index}
        onTouchStart={this.onTouch.bind(this)}
        className={'led-image ' + (this.props.selected?'highlight':'')}
        style={{width: width}}
        >
        {this.renderCells(options)}
      </ul>
    );
  }
}

class ImageDialog extends Component {
  constructor(){
    super(...arguments);
    this.history = new History(MAX_HISTORY);
    this.isHistory = false;
    this.state={
      modalIsOpen: false,
      title: '',
      conf: { image: []},
      onConfirm: null,
      currentFrame: 0,
      currentColor: DEFAULT_COLOR,
      isPlaying: false,
      showExamples: false
    };
  }

  setState(state) {
    // overwrite default setState to save history
    super.setState(state);
    if(this.isHistory) {
      this.isHistory = false;
      return;
    }
    if(typeof state.conf != 'undefined') {
      this.history.record(this.copyConfDeep(state.conf));
    }
  }

  closeModal() {
    this.setState({
      modalIsOpen: false,
      isPlaying: false
    });
    this.stopFrames();
  }

  renderExamples() {
    let images = [];
    for( let i=0; i<EXAMPLE_IMAGES.length; i++ ) {
      images.push(
        <Ledimage readonly onSelect={this.useExample.bind(this)} index={i} key={i} width={80} image={EXAMPLE_IMAGES[i]}/>
      );
    }
    return (
      <div className="image-dialog-example-images" style={{display: this.state.showExamples?'block': 'none'}}>
        {images}
      </div>
    );
  }

  useExample(e) {
    if(this.state.isPlaying) {
      return;
    }
    let newConf = this.state.conf;
    newConf.image[this.state.currentFrame] = EXAMPLE_IMAGES[e.currentTarget.dataset.index].slice();
    this.setState({
      showExamples: false,
      conf: newConf
    });
  }

  setCurrentFrame(e) {
    if(this.state.isPlaying) {
      return;
    }
    this.setState({
      currentFrame: parseInt(e.currentTarget.dataset.index)
    });
  }

  renderFrames() {
    let self = this;
    let frames = [];
    let deletes = [];
    let image =  this.state.conf.image;
    for( let i=0; i<image.length; i++ ) {
      frames.push(
        <Ledimage readonly onSelect={this.setCurrentFrame.bind(this)} index={i} key={i} width={50} selected={i==this.state.currentFrame?true:false} image={image[i]}/>
      );
      deletes.push(
        <span className='frame-delete' key={i} style={{visibility: (i==this.state.currentFrame)?'visible': 'hidden'}} {...tapOrClick(this.deleteFrame.bind(this))}>
          <i className='icon-remove'></i>
        </span>
      );
    }
    return (
      <div className="image-dialog-frames">
        <div className='image-dialog-frame-delete'>
          {deletes}
        </div>
        <div className="image-dialog-frames-title">{languages.getTranslation('dialog-image-frames')}</div>
        {frames}
        <span {...tapOrClick(this.addFrame.bind(this))} className="image-dialog-add-frame" style={{display:image.length<4?'block': 'none'}}>
          <i className="fa fa-plus"></i>
        </span>
        <span className={'image-dialog-play ' + (self.state.conf.image.length<=1? 'disabled':'')} {...tapOrClick(this.playFrames.bind(this))}>
          <i className={'fa ' + (this.state.isPlaying? 'fa-stop':'fa-play')}></i>
        </span>
      </div>
    );
  }

  renderActions() {
    return (
      <div className="image-dialog-actions">
        <span className={'image-dialog-undo '} {...tapOrClick(this.undo.bind(this))}>
          <i className="icon-undo"></i>
        </span>
        <span className={'image-dialog-redo '} {...tapOrClick(this.redo.bind(this))}>
          <i className="icon-redo"></i>
        </span>
        <span className={'image-dialog-empty '} {...tapOrClick(this.empty.bind(this))}>
          <i className="icon-trash-can3"></i>
        </span>
        <span className={'image-dialog-examples ' + (this.state.showExamples?'open': '')} {...tapOrClick(this.toggleExamples.bind(this))}>
          <i className="icon-happy"></i>
        </span>
      </div>
    );
  }

  addFrame() {
    if(this.state.isPlaying) {
      return;
    }
    let newConf = this.state.conf;
    newConf.image.push(EMPTY_IMAGE.slice());
    this.setState({
      conf: newConf,
      currentFrame: newConf.image.length - 1
    });
  }

  deleteFrame() {
    if( this.state.conf.image.length<=1 ) {
      return;
    }
    if(this.state.isPlaying) {
      return;
    }
    let newConf = this.state.conf;
    let currentFrame = this.state.currentFrame;
    newConf.image.splice(currentFrame, 1);
    if(currentFrame == this.state.conf.image.length) {
      currentFrame --;
    }
    this.setState({
      conf: newConf,
      currentFrame: currentFrame
    });
  }

  stopFrames() {
    let self = this;
    self.timmer && clearInterval(self.timmer);
    self.setState({
      isPlaying: false
    });
  }

  playFrames() {
    if (this.state.conf.image.length <= 1) {
      return;
    }
    let self = this;
    let curr = 0;
    let frameCnt = this.state.conf.image.length;
    if (self.state.isPlaying) {
      self.stopFrames();
    } else {
      self.setState({
        isPlaying: true,
        currentFrame: curr++
      });
      self.timmer = setInterval(() => {
        self.setState({
          currentFrame: curr++
        });
        if (curr >= frameCnt) {
          curr = 0;
        }
      }, 500);
    }
  }

  copyConfDeep(conf) {
    let newConf = Object.assign({}, conf);
    // deep clone
    newConf.image = [];
    for(let i=0; i<conf.image.length; i++) {
      newConf.image.push(conf.image[i].slice());
    }
    return newConf;
  }

  undo() {
    if(this.state.isPlaying) {
      return;
    }
    let conf = this.history.undo();
    if(conf !== null) {
      this.isHistory = true;
      this.setState({
        conf: this.copyConfDeep(conf)
      });
    }
  }

  redo() {
    if(this.state.isPlaying) {
      return;
    }
    let conf = this.history.redo();
    if(conf !== null) {
      this.isHistory = true;
      this.setState({
        conf: this.copyConfDeep(conf)
      });
    }
  }

  empty() {
    if(this.state.isPlaying) {
      return;
    }
    let newConf = this.state.conf;
    newConf.image[this.state.currentFrame] = Object.assign([], EMPTY_IMAGE);
    this.setState({
      conf: newConf
    });
  }

  toggleExamples() {
    this.setState({
      showExamples: this.state.showExamples? false: true
    });
  }

  render(){
    let self = this;
    return (
      <Modal
        isOpen={self.state.modalIsOpen}
        className='image-dialog dialog'
        contentLabel='ImageDialogModal'
        overlayClassName='dialog-overlay'>
        <div className='dialog-container' ref='container'>
          <div className='title'>
            {self.state.title}
          </div>
          <div className={'image-dialog-body ' + (this.state.showExamples?'spring': '')}>
            <DialogColorList color={DEFAULT_COLOR} onSelect={self.onSelect.bind(self)}/>
            <div className="image-dialog-editer">
              {this.renderFrames()}
              <div className="image-dialog-image">
                <Ledimage width={360} onDrawPoint={this.onDrawPoint.bind(this)} image={this.state.conf.image[this.state.currentFrame] || EMPTY_IMAGE}/>
              </div>
              {this.renderActions()}
            </div>
            {this.renderExamples()}
            <div className="color-dialog-footer">
              <span className="color-dialog-btn color-dialog-confirm" {...tapOrClick(this.onConfirm.bind(this))}>{languages.getTranslation('dialog-action-confirm')}</span>
              <span className="color-dialog-btn color-dialog-cancel" {...tapOrClick(this.onCancel.bind(this))}>{languages.getTranslation('dialog-action-cancel')}</span>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  onSelect(color){
    //get selected color
    this.setState({
      currentColor: color.id
    });
  }

  onCancel() {
    this.state.onConfirm && this.state.onConfirm(this.originConf.toJS().image);
    this.closeModal();
  }

  onConfirm() {
    this.closeModal();
    this.state.onConfirm && this.state.onConfirm(this.state.conf.image);
  }

  onDrawPoint(idx) {
    if(this.state.isPlaying) {
      return;
    }
    let newConf = this.state.conf;
    newConf.image[this.state.currentFrame][idx] = parseInt(this.state.currentColor);
    this.setState({
      conf: newConf
    });
  }

  componentDidMount() {
    let self = this;
    self._registerToken = AppDispatcher.register((action) => {
      if (action.actionType === AppConstants.IMAGE_SETTING_DIALOG) {
        if (!action.defaultConf.image || action.defaultConf.image.length === 0) {
          action.defaultConf.image = [];
          for (let i = 0; i < DEFAULT_IMAGES.length; i++) {
            action.defaultConf.image.push(DEFAULT_IMAGES[i].slice());
          }
        }
        self.history.reset();
        self.originConf = Immutable.fromJS(action.defaultConf);
        self.setState({
          modalIsOpen: true,
          title: action.titleName,
          conf: action.defaultConf,
          onConfirm: action.onConfirm,
          currentFrame: 0,
          isPlaying: false,
          currentColor: DEFAULT_COLOR,
          id: action.id
        });
      }
    });

  }

  componentWillUnmount() {
    let self = this;
    AppDispatcher.unregister(self._registerToken);
  }
}

export { ImageDialog, Ledimage, EXAMPLE_IMAGES};