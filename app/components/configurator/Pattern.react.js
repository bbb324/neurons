import React, { Component } from 'react';
import tapOrClick from 'react-tap-or-click';
import UIActions from '../../actions/UIActions';
import languages from '../../languages';

                  //   黑0       红1          橙2        黄3       绿4         青5         蓝6         紫7        白8
const COLOR_LIST = ['#9DB0CE', '#FF0000', '#FFAF00', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#D400FF', '#FFFFFF'];
const EXAMPLE_IMAGES = [
  // 
  {
    mode: 'static',
    colors: [1,2,3,4,5,6,7]
  },
  // 
  {
    mode: 'roll',
    colors: [1,2,3,2,1]
  },
  // 
  {
    mode: 'repeat',
    colors: [5,7,8,7,5]
  },
  // 
  {
    mode: 'marquee',
    colors: [4,3,8,3,4]
  },
];

class LedSet extends Component {
  constructor() {
    super();
  }
  renderCells(colors) {
    if(colors){
      let data = colors;
      let tmp = data.map(function (value, key) {
        if (key <= 7) {
          return (
            <li className={'ledList '+(key==7?' mid': '')} key={key} data-color={value}
                style={{backgroundColor: COLOR_LIST[value]}}>
            </li>
          );  
        } else {
          return (
            <li className={'lower ledList'} key={key} data-color={value}
                style={{backgroundColor: COLOR_LIST[value]}}>
            </li>
          );
        }
      });
      return tmp;
    }
  }
  render() {
    let colors = this.props.colors;
    return (   
        <ul className='ledListPreview'>
            {this.renderCells(colors)}
        </ul>  
    );
  }  
}

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
    this.props.onChange && this.props.onChange(this.props.name, {pattern: EXAMPLE_IMAGES[e.target.dataset.id], selected: e.target.dataset.id});
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
        <ul className='image-ul'>
          {this.imageList()}
        </ul>
        <div className={'led-pattern '   + (4 == selected?'highlight':'')} {...tapOrClick(this.displayEditPattern.bind(this))}>
          <LedSet colors={this.state.pattern.colors}/>
        </div>
        <span className="editPattern" {...tapOrClick(this.openDrawPattern.bind(this))}>{languages.getTranslation('editPattern')}</span>
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