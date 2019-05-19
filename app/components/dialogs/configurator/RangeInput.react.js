/**
 * Created by junxie on 17/7/20.
 */
import React, { Component } from 'react';
import NumberInput from 'react-number-input';
import nodeStore from '../../../stores/nodeStore';
require('./configurator.less');

class RangeInput extends Component {
  constructor() {
    super(...arguments);
    this.config = [];
    this.state = {
      value: []
    };
  }

  change(value, ele) {
    this.props.onChange && this.props.onChange(ele.target.classList[0], value);
  }

  setting() {
    let array = nodeStore.getNodeConfigs(this.props.id);
    let keys = Object.keys(array);
    let collection = [];
    for(let i of keys) {
      if(i != 'trigger') {  // 因为随机数的一个参数是 trigger，不应该设置值
        let result = nodeStore.getCurrentConfig(this.props.id, i);
        collection.push(result);
        this.props.onChange && this.props.onChange(i, result);
      }
    }
    this.setState({
      value: collection
    });
  }


  renderInput() {
    let ele = [];
    let keys = Object.keys(this.props.config);

    let array = keys;
    if(this.props.type == 'RANDOM') {
      keys = keys.length-1;
    } else {
      keys = keys.length;
    }
    for(let i=0; i<keys; i++) {
      if(i==2) {
        ele.push(<img className='scale-arrow' src='./img/icon-arrow-scale.png'  key={'arrow'}/>);
      }
      ele.push(<NumberInput
        className={array[i]+' input-'+this.props.type}
        type="tel"                      // optional, input[type]. Defaults to "tel" to allow non numeric characters
        value = {this.state.value[i]}
        onChange={this.change.bind(this)}
        format="0,0[.]00"               // optional, numbro.js format string. Defaults to "0,0[.][00]"
        key={keys[i]}
        />);
      ele.push(<span className='separate'>~</span>);
    }
    return ele;
  }

  render() {
    return (<div className={'input-div-'+this.props.type}>
      {this.renderInput()}
    </div>);
  }

  componentDidMount() {
    this.setting();
  }
}

export { RangeInput };