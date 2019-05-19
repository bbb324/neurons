import React, { Component } from 'react';
import tapOrClick from 'react-tap-or-click';
import UIActions from '../../../actions/UIActions';
import languages from '../../../languages';

const COLOR_LIST = ['#000000', '#ff0000', '#ffaf00', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#d400ff', '#ffffff'];
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

class Image extends Component {
  constructor() {
    super(...arguments);
    this.imageArray = ['img/LedPanel/icon-laugh.png',
      'img/LedPanel/icon-upset.png',
      'img/LedPanel/icon-angry.png',
      'img/LedPanel/icon-heart.png'];
    this.state = {
      id: this.props.id,
      images:(this.props.editImage=== null  || this.props.editImage.length === 0)? this.clearState(): this.props.editImage,
      selected: this.props.selected === null ? 0: this.props.selected
    };
  }

  clearState(){
    return [
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
    ] ;
  }

  displayImage(e) {
    this.setState({
      selected: e.target.dataset.id
    });
    this.props.onChange && this.props.onChange(this.props.name, {matrix: [EXAMPLE_IMAGES[e.target.dataset.id]], selected: Number(e.target.dataset.id)});
  }

  displayEditImage(){
    this.setState({
      selected: 4
    });
    this.props.onChange && this.props.onChange(this.props.name, {matrix:this.state.images, selected: 4});
  }

  imageCallback(image){
    this.setState({
      selected: 4,
      images: image
    });
    this.props.onChange && this.props.onChange(this.props.name, {matrix:image, selected: 4}, 'reOpen');

  }

  openDrawPanel() {
    UIActions.showImageDialog(languages.getTranslation('image'), this.props.id, {image: this.state.images},this.imageCallback.bind(this));
  }

  imageList() {
    let pngList = [];
    let selected = this.state.selected;
    for (let i in this.imageArray) {
      pngList.push(<li key={i} data-id={i} style={{
        background: 'url("'+this.imageArray[i]+'") center center / 36px no-repeat'}}
                       className={'display-image '  + (i == selected?'highlight':'')} {...tapOrClick(this.displayImage.bind(this))}></li>);
    }
    return pngList;
  }

  renderCells() {
    let width = 36;
    let cellWidth = (width - 8)/8;
    let cellRadius = width/30;
    let image = this.state.images[0] || [];
    let cells = [];
    for(let i=0; i<image.length; i++) {
      cells.push(
        <li
          key={i} data-idx={i} className="led-image-cell"
          style={{
            background: COLOR_LIST[image[i]], 
            width: cellWidth, 
            height: cellWidth, 
            borderRadius: cellRadius
          }}
          ></li>
      );
    }
    return cells;
  }

  render() {
    let selected = this.state.selected;
    return (
      <div className='image-panel'>
        <div className='image-option'>
          <div className='image-title'>{languages.getTranslation('configDialog-select')}</div>
          <ul className='image-ul'>
            {this.imageList()}
          </ul>
        </div>
        <div className='image-customize'>
          <div className='image-title'>{languages.getTranslation('pattern-customize')}</div>
            <div className='image-div'>
              <div className={'image-container '+(4 == selected?'highlight':'')}>
                <ul
                  className={'led-image'}
                  {...tapOrClick(this.displayEditImage.bind(this))}
                  >
                  {this.renderCells()}
                </ul>
              </div>
              <span className="editImage" {...tapOrClick(this.openDrawPanel.bind(this))}>{languages.getTranslation('editImage')}</span>
            </div>
          </div>
      </div>
    );
  }

  componentDidMount(){
    let self = this;
    let selected = self.state.selected;
    let conf = (selected===4 ? {matrix:this.state.images, selected: 4} : {matrix: [EXAMPLE_IMAGES[selected]], selected: selected});
    this.props.onChange && this.props.onChange(this.props.name, conf);
  }
}

export { Image };