import React, { PureComponent } from 'react';
import { Select } from './Select.react';
import tapOrClick from 'react-tap-or-click';
import engine from '../../core/FlowEngine';
import UIActions from '../../actions/UIActions';
import commonStore from '../../stores/commonStore';
import languages from '../../languages';
import {isParent} from '../../utils/dom';

class SmartServoAction extends PureComponent {
  constructor() {
    super(...arguments);
    let configs = this.props.configs;
    this.state = {
      id: this.props.id,
      no: configs.no.defaultValue,
      setZero: false,
      moveType: configs.moveType.defaultValue,
      angle: configs.angle.defaultValue,
      lock: configs.lock.defaultValue,
      speed: configs.speed.defaultValue,
      delay: configs.delay.defaultValue,
    };

    this.emitter = this.props.emitter;

    this.onConfigSelect = this.onConfigSelect.bind(this);
    this.setAngleDisabled = this.setAngleDisabled.bind(this);
    this.setZero = this.setZero.bind(this);
    this.setLockState = this.setLockState.bind(this);
    this.isHasServo = this.isHasServo.bind(this);
    this.OpenSmartServoDialog = this.OpenSmartServoDialog.bind(this);
    this.openNumberInput = this.openNumberInput.bind(this);
    this.syncServoNoToConfigurator = this.syncServoNoToConfigurator.bind(this);
  }

  onConfigSelect(key, value){
    console.log('selectChange:', key, value);
    this.props.onChange && this.props.onChange(key, value);
    this.setState({
      moveType: value
    });
    this.setAngleDisabled(value);
  }

  setAngleDisabled(value) {
    if(value === 'keep moving') {
      this.refs.angleSection.classList.add('angle-opacity');
      this.refs.angleMask.classList.add('angle-shade');
    }else {
      this.refs.angleSection.classList.remove('angle-opacity');
      this.refs.angleMask.classList.remove('angle-shade');
    }
  }

  setZero() {
    if(this.state.setZero === false) {
      console.log('set zero');
      this.props.onChange && this.props.onChange('setZero', true);
      this.setState({
        setZero: true
      });
      setTimeout(() => {
        this.setState({
          setZero: false
        });
      }, 2000);
    }
  }

  setLockState() {
    console.log('set lock');
    if(this.state.lock === 'lock') {
      this.props.onChange && this.props.onChange('lock', 'unlock');
      this.setState({
        lock: 'unlock'
      });
    }else {
      this.props.onChange && this.props.onChange('lock', 'lock');
      this.setState({
        lock: 'lock'
      });
    }
  }

  isHasServo() {
    if(!this.state.no) {
      this.refs.maskSection.classList.add('mask-opacity');
      this.refs.maskShade.classList.add('mask-shade');
    }else {
      this.refs.maskSection.classList.remove('mask-opacity');
      this.refs.maskShade.classList.remove('mask-shade');
    }
  }

  OpenSmartServoDialog() {
    console.log('open Dialog');
    let listLength = engine.getElectronicNodeCountByType('SMARTSERVO');
    console.log('listLength', listLength);
    let length = listLength || 0;
    UIActions.openSmartServoDialog(this.props.id, this.state.no, length);

  }

  openNumberInput(e) {
    console.log('open number');
    let target  = e.target;
    let actualTarget = '';
    let angleInput = target.closest('.node-config[data-bodyStyle="smartServoAction"]').querySelector('.angle-input');
    let isParentBln = isParent(target, angleInput);
    console.log('target', target);
    console.log('isParentBln', isParentBln);
    if(isParentBln) {
      actualTarget = angleInput;
    }else {
      actualTarget = target;
    }
    
    UIActions.openNumberInputDialog((num) => {
      let value = Number(num);
      let dataType = actualTarget.getAttribute('data-type');
      if(dataType === 'angle') {
        if(value > 720) {
          value = 720;
        }
        if(value < -720) {
          value = -720;
        }
        value = parseInt(value,10);
        actualTarget.querySelector('span').textContent = value;
      }else {
        if(dataType === 'speed') {
          if(value > 100) {
            value = 100;
          }
          if(value < -100) {
            value = -100;
          }
        }else {
          if(value < 0) {
            value = 0;
          }
        }
        value = parseInt(value,10);
        actualTarget.textContent = value;
      }

      this.props.onChange && this.props.onChange(dataType, value);
    });
  }

  render() {
    return(
      <div className="config-con">
        <div className="no" {...tapOrClick(this.OpenSmartServoDialog)}>{
          this.state.no ? <span>NO.{this.state.no}{' '}{languages.getTranslation('smart-servo')}</span> : <span>{languages.getTranslation('select-smart-servo')}</span>
          }
        </div>
        <div className="mask-section" ref="maskSection">
          <div className="set-zero">
            <span className="zero-tips">{languages.getTranslation('set-zero-point')}</span>
            <span className="zero-button" {...tapOrClick(this.setZero)}>
              {this.state.setZero === false ? languages.getTranslation('zero-set') : <img src="./img/icon-servo-setZero.png" alt=""/>}
            </span>
          </div>
          <Select name={'moveType'} config={this.props.configs.moveType} selectStyle={this.props.selectStyle} onChange={this.onConfigSelect} />
          <div className="angle-wrap" ref="angleSection">
            <img src="./img/icon-servo-angle.png" alt=""/>
            <div className="common-number angle-input" data-type="angle" {...tapOrClick(this.openNumberInput)}>
              <span>{this.state.angle}</span>
              <img src="./img/icon-degree-blue.png" alt=""/>
            </div>
            <div className="lock-state" {...tapOrClick(this.setLockState)}>
              {this.state.lock === 'lock' ? <img src="./img/icon-servo-lock.png" alt=""/> : <img src="./img/icon-servo-unlock.png" alt=""/>}
            </div>
            <div ref="angleMask"></div>
          </div>
          <div className="speed-wrap">
            <img src="./img/icon-servo-speed.png" alt=""/>
            <div className="common-number speed-input" data-type="speed" {...tapOrClick(this.openNumberInput)}>{this.state.speed}</div>
            <span>{languages.getTranslation('servo-rpm')}</span>
          </div>
          <div className="delay-wrap">
            <img src="./img/icon-servo-delay.png" alt=""/>
            <div className="common-number second-input" data-type="delay"  {...tapOrClick(this.openNumberInput)}>{this.state.delay}</div>
            <span>{languages.getTranslation('servo-second')}</span>
          </div>
          <div ref="maskShade"></div>
        </div>
      </div>
    );
  }

  syncServoNoToConfigurator() {
    if(this.state.id === commonStore.servoId) {
      this.setState({
        no: commonStore.servoNo
      });
      setTimeout(() => {
        this.props.onChange && this.props.onChange('no', commonStore.servoNo);
      }, 0);
      //remove mask
      this.refs.maskSection && this.refs.maskSection.classList.remove('mask-opacity');
      this.refs.maskShade && this.refs.maskShade.classList.remove('mask-shade');
    }
  }

  componentDidMount() {
    for ( let key in this.props.configs){
      if (this.props.configs[key].hasOwnProperty('defaultValue')){
        this.props.onChange && this.props.onChange( key, this.props.configs[key].defaultValue);
      }
    }
    this.isHasServo();
    commonStore.on('syncServoNoToConfigurator', this.syncServoNoToConfigurator);
  }

  componentWillUnmount() {
    commonStore.on('syncServoNoToConfigurator', this.syncServoNoToConfigurator);
  }
}

export { SmartServoAction };