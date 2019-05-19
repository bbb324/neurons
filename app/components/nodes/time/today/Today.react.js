import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../Node.react';
import languages from '../../../../languages';
import nodeStore from '../../../../stores/nodeStore';
require('./Today.less');

class TodayNode extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {
      month: 0,
      day: 0,
      week: 0
    };
    this.getMonth = this.getMonth.bind(this);
    this.getWeek = this.getWeek.bind(this);
  }

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src='./img/icon-today.png' />
        <span className="node-preview-name">{languages.getTranslation('today')}</span>
      </div>
    );
  }

  getMonth(month) {

    if(navigator.language.toLowerCase() !== 'zh-cn' && navigator.language.toLowerCase() !== 'zh-tw') {
      let eMonth = '';
      switch (month) {
      case 1:
        eMonth = 'Jan';
        break;
      case 2:
        eMonth = 'Feb';
        break;
      case 3:
        eMonth = 'Mar';
        break;
      case 4:
        eMonth = 'Apr';
        break;
      case 5:
        eMonth = 'May';
        break;
      case 6:
        eMonth = 'June';
        break;
      case 7:
        eMonth = 'July';
        break;
      case 8:
        eMonth = 'Aug';
        break;
      case 9:
        eMonth = 'Sept';
        break;
      case 10:
        eMonth = 'Oct';
        break;
      case 11:
        eMonth = 'Nov';
        break;
      case 12:
        eMonth = 'Dec';
        break;
      }
      return eMonth + ' ';
    }else{
      return month;
    }
  }

  getWeek(week) {
    if(navigator.language.toLowerCase() !== 'zh-cn' && navigator.language.toLowerCase() !== 'zh-tw') {
      let eWeek = '';
      switch (week) {
      case 0:
        eWeek = 'Sun';
        break;
      case 1:
        eWeek = 'Mon';
        break;
      case 2:
        eWeek = 'Tues';
        break;
      case 3:
        eWeek = 'Wed';
        break;
      case 4:
        eWeek = 'Thur';
        break;
      case 5:
        eWeek = 'Fri';
        break;
      case 6:
        eWeek = 'Sat';
        break;
      }
      return eWeek;
    }else{
      return week;
    }
  }

  renderActual() {
    return (
      <div className={'node-actual node-type-' + this.props.info.name} id={this.props.id} style={{
        left: this.props.left + 'px',
        top: this.props.top + 'px'
      }} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <div className='node-body node-draggable hide-config'>
          <div className='node-actual-body'>
            <span className="date">{this.getMonth(this.state.month)}{languages.getTranslation('another-month')}{this.state.day}{languages.getTranslation('another-day')}</span>
            <span className="week">{languages.getTranslation('another-week')}{this.getWeek(this.state.week)}</span>
          </div>
        </div>
        <Inputs ports={this.props.info.props.in} nodeId={this.props.id} />
        <Outputs ports={this.props.info.props.out} nodeId={this.props.id} showValue={true}/>
        <Tools nodeId={this.props.id} />
      </div>
    );
  }

  render() {
    return this.props.isPreview ? this.renderPreview() : this.renderActual();
  }

  nodeOutPutChange(bundle){
    if(this.props.id == bundle.id){
      switch (bundle.port) {
      case 'month':
        this.setState({month: bundle.value});
        break;
      case 'day':
        this.setState({day: bundle.value});
        break;
      case 'week':
        this.setState({week: bundle.value});
        break;   
      }       
    }
  }

  componentDidMount(){
    this.nodeOutPutChangeFunc = this.nodeOutPutChange.bind(this);
    nodeStore.on('NodeOutputChange', this.nodeOutPutChangeFunc);
  }
  componentWillUnmount(){
    nodeStore.off('NodeOutputChange', this.nodeOutPutChangeFunc);
  }
  
}

export { TodayNode };
