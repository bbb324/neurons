import React, { Component } from 'react';
import tapOrClick from 'react-tap-or-click';
import UIActions from '../../../actions/UIActions';
import languages from '../../../languages';
import {EXAMPLE_IMAGES, LedSet} from '../../nodes/assist/led/pattern/Pattern.react';

class Pattern extends Component {
  constructor() {
    super(...arguments);
    this.imageArray = ['img/LedStrip/1.png',
      'img/LedStrip/2.png',
      'img/LedStrip/3.png',
      'img/LedStrip/4.png'];
    this.state = {
      id: this.props.id,
      pattern: this.props.editPattern===null ? this.clearState() : this.props.editPattern,
      selected: this.props.selected
    };
  }

  clearState(){
    return {mode: 'static', colors: [0,0,0]};
  }

  displayPattern(e) {
    this.setState({
      selected: e.target.dataset.id
    });
    this.props.onChange && this.props.onChange(this.props.name, {pattern: EXAMPLE_IMAGES[e.target.dataset.id], selected: Number(e.target.dataset.id)});
  }

  displayEditPattern(){
    this.setState({
      selected: 4
    });
    this.props.onChange && this.props.onChange(this.props.name, {pattern: this.state.pattern,selected: 4});
  }

  patternCallback(pattern){
    this.setState({
      selected: 4,
      pattern: pattern
    });
    this.props.onChange && this.props.onChange(this.props.name, {pattern: pattern,selected: 4});
  }

  openDrawPattern() {
    let self = this;
    UIActions.showPatternDialog(languages.getTranslation('dialog-pattern-title'), this.props.id, {pattern: self.state.pattern},this.patternCallback.bind(this));
  }

  imageList() {
    let selected = this.state.selected;
    let pngList = [];
    for (let i in this.imageArray) {
      pngList.push(<li key={i} data-id={i} style={{
        background: 'url("'+this.imageArray[i]+'") center center / 36px no-repeat'}}
                       className={'display-image '  + (i == selected?'highlight':'')} {...tapOrClick(this.displayPattern.bind(this))}></li>);
    }
    return pngList;
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
            <div className={'led-pattern '   + (4 == selected?'highlight':'')} {...tapOrClick(this.displayEditPattern.bind(this))}>
              <LedSet colors={this.state.pattern.colors}/>
            </div>
            <span className="editPattern" {...tapOrClick(this.openDrawPattern.bind(this))}>{languages.getTranslation('editPattern')}</span>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount(){
    let self = this;
    let selected = self.state.selected;
    let conf = (selected===4 ? {pattern:this.state.pattern, selected: 4} : {pattern: EXAMPLE_IMAGES[selected], selected: selected});
    this.props.onChange && this.props.onChange(this.props.name, conf);
  }
}

export { Pattern, LedSet};
