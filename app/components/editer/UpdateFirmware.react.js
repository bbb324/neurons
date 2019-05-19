import React, { Component } from 'react';
import AppDispatcher from '../../dispatcher/AppDispatcher';
import AppConstants from '../../constants/AppConstants';
import tapOrClick from '../../utils/tapOrClick';
import nodeStore from '../../stores/nodeStore';
import firmwareStore from '../../stores/firmwareStore';
import linkStore from '../../stores/LinkStore';
import wifiStore from '../../stores/wifiStore';
import languages from '../../languages';
import UIActions from '../../actions/UIActions';
import './editer.less';

class UpdateFirmware extends Component{
  constructor() {
    super(...arguments);
    //update firmware flow
    this.firmwareSteps = {
      beforeInsert: 'beforeInsert',
      disconnected: 'disconnected',
      insertAnother: 'insertAnother',
      readyUpdate: 'readyUpdate',
      showProgress: 'showProgress',
      updateFailed: 'updateFailed',
      done: 'done'
    };

    this.connectedTypes = {
      ble: 'ble',
      wifi: 'wifi'
    };

    this.state = {
      isActive: false,
      id: null,
      closeBtn: true,
      connectedType: '', // ble || wifi
      firmwareStep: ''
    };

    this.showFirmWareSection = this.showFirmWareSection.bind(this);
    this.getConnectedTypeBlock = this.getConnectedTypeBlock.bind(this);
    this.getSpecificFirmwareBlock = this.getSpecificFirmwareBlock.bind(this);
    this.showTextSection = this.showTextSection.bind(this);
    this.showProgressDisconnect = this.showProgressDisconnect.bind(this);
    this.openShowProgressDialog = this.openShowProgressDialog.bind(this);
    this.getUpdateBlockFirmwareResult = this.getUpdateBlockFirmwareResult.bind(this);
    this.closePanel = this.closePanel.bind(this);
    this.communicationBlockDisconnect = this.communicationBlockDisconnect.bind(this);
    this.getFirstNodeNeedUpdate = this.getFirstNodeNeedUpdate.bind(this);
    this.renderPop = this.renderPop.bind(this);


  }

  //图片区域
  showFirmWareSection() {
    let firmwareStep = this.state.firmwareStep;
    switch (firmwareStep) {
    case this.firmwareSteps.beforeInsert:
    case this.firmwareSteps.disconnected:
      return (
        <div className="firmware-section before-insert">
          {this.getConnectedTypeBlock()}
          <div className="block-wrap">
            <img ref="iconArrow" className="firmware-icon-arrow" src="img/icon-update-arrow.png" alt=""/>
            <div ref="rightBlockSection" className="block-section right-block-section">
              <span className="rect"></span>
              {this.getSpecificFirmwareBlock()}
            </div>
          </div>
        </div>
      );
    case this.firmwareSteps.insertAnother:
      return (
        <div className="firmware-section insert-another">
          {this.getConnectedTypeBlock()}
          <div className="block-wrap">
            <img className="firmware-icon-arrow" src="img/icon-update-arrow.png" alt=""/>
            <div className="block-section right-block-section">
              <span className="rect"></span>
              {this.getSpecificFirmwareBlock()}
            </div>
            <div className="block-section common-block-section">
              <span className="rect"></span>
              <img  className="common-firmware-block firmware-block" src="img/icon-common-block.png" alt=""/>
            </div>
          </div>
        </div>
      );
    case this.firmwareSteps.readyUpdate:
      return (
        <div className="firmware-section ready-update">
          {this.getConnectedTypeBlock()}
          <div className="block-wrap insert-right">
            {this.getSpecificFirmwareBlock()}
          </div>
        </div>
      );
    case this.firmwareSteps.showProgress:
      return (
        <div className="firmware-section show-progress">
          {this.getConnectedTypeBlock()}
          <div className="block-wrap insert-right">
            {this.getSpecificFirmwareBlock()}
          </div>
          <span ref="progressLine" className="progress-line"></span>
        </div>
      );
    case this.firmwareSteps.updateFailed:
      return (
        <div className="firmware-section update-failed">
          {this.getConnectedTypeBlock()}
          <div className="block-wrap insert-right">
            {this.getSpecificFirmwareBlock()}
            <img className="firmware-icon-retry" src="img/icon-update-fail.png" alt=""/>
          </div>
        </div>
      );
    case this.firmwareSteps.done:
      return (
        <div className="firmware-section update-done">
          {this.getConnectedTypeBlock()}
          <div className="block-wrap insert-right">
            {this.getSpecificFirmwareBlock()}
            <img className="firmware-icon-done" src="img/icon-update-done.png" alt=""/>
          </div>
        </div>
      );
    }
  }

  getConnectedTypeBlock() {
    let connectedType = this.state.connectedType;
    if(connectedType === this.connectedTypes.ble) {
      return (
        <img className="firmware-icon-bluetooth" src="img/update-firmware-blt.png" alt=""/>
      );
    }else if(connectedType === this.connectedTypes.wifi) {
      return (
        <img className="firmware-icon-wifi" src="img/update-firmware-wifi.png" alt=""/>
      );
    }
  }

  getSpecificFirmwareBlock() {
    let blockType = this.state.type;
    let src = '';
    console.log('nodeType:', blockType);
    switch (blockType) {
    case 'BUTTON':
      src = 'icon-button.png';
      break;
    case 'BUZZER':
      src = 'icon-buzzer.png';
      break;
    case 'COLORSENSOR':
      src = 'icon-colorSensor.png';
      break;
    case 'OLED_DISPLAY':
      src = 'icon-display.png';
      break;
    case 'MOTORS':
      src = 'icon-duo-motor.png';
      break;
    case 'ELWIRES':
      src = 'icon-elWires.png';
      break;
    case 'FUNNYTOUCH':
      src = 'icon-funnyTouch.png';
      break;
    case 'ACCELEROMETER_GYRO':
      src = 'icon-gyroSensor.png';
      break;
    case 'HUMITURE':
      src = 'icon-humiture.png';
      break;
    case 'JOYSTICK':
      src = 'icon-joystick.png';
      break;
    case 'KNOB':
      src = 'icon-knob.png';
      break;
    case 'LED':
    case 'LEDSTRIP':
      src = 'icon-led.png';
      break;
    case 'LEDPANEL':
      src = 'led-matrix.png';
      break;
    case 'LIGHTSENSOR':
      src = 'icon-lightsensor.png';
      break;
    case 'LINEFOLLOWER':
      src = 'icon-line-follower.png';
      break;
    case 'PIR':
      src = 'icon-pir.png';
      break;
    case 'SERVO':
      src = 'icon-servo.png';
      break;
    case 'SOIL_HUMIDITY':
      src = 'icon-soilMoisture.png';
      break;
    case 'SOUNDSENSOR':
      src = 'icon-sound-sensor.png';
      break;
    case 'TEMPERATURE':
      src = 'icon-temperature.png';
      break;
    case 'ULTRASONIC':
      src = 'icon-ultrasonic.png';
      break;
    case 'VOISERECOGNITION':
      src = 'icon-voiceRecognition.png';
      break;
    }
    console.log('imgSrc:', src);
    return (<img className="right-block firmware-block" src={'img/' + src} alt=""/>);
  }

  //底部文字区域
  showTextSection() {
    let firmwareStep = this.state.firmwareStep;
    switch (firmwareStep) {
    case this.firmwareSteps.beforeInsert:
      return (
        <div className="text-section">
          <h3 className="tips-title">{languages.getTranslation('update-firmware')}</h3>
          <div className="tips-text">{this.state.connectedType === this.connectedTypes.ble ? languages.getTranslation('connect-blt-block') : languages.getTranslation('connect-wifi-block')}</div>
        </div>
      );
    case this.firmwareSteps.disconnected:
      return (
        <div className="text-section">
          <h3 className="tips-title">{languages.getTranslation('block-disconnected')}</h3>
          <div className="tips-text">{this.state.connectedType === this.connectedTypes.ble ? languages.getTranslation('connect-blt-block') : languages.getTranslation('connect-wifi-block')}</div>
        </div>
      );
    case this.firmwareSteps.insertAnother:
      return (
        <div className="text-section">
          <h3 className="tips-title">{languages.getTranslation('connect-another')}</h3>
          <div className="tips-text">{languages.getTranslation('connect-another-text')}</div>
        </div>
      );
    case this.firmwareSteps.readyUpdate:
      return (
        <div className="text-section">
          <h3 className="tips-title">{languages.getTranslation('ready-update-firmware')}</h3>
          <div className="tips-text">{languages.getTranslation('click-button-update')}</div>
          <div className="btn" {...tapOrClick(this.openShowProgressDialog)}>{languages.getTranslation('update-firmware-btn')}</div>
        </div>
      );
    case this.firmwareSteps.showProgress:
      return (
        <div className="text-section">
          <h3 className="tips-title">{languages.getTranslation('updating-firmware')}</h3>
          <div className="tips-text">{this.state.connectedType === this.connectedTypes.ble ? languages.getTranslation('not-remove-blt') : languages.getTranslation('not-remove-wifi')}</div>
        </div>
      );
    case this.firmwareSteps.updateFailed:
      return (
        <div className="text-section">
          <h3 className="tips-title">{languages.getTranslation('update-failed')}</h3>
          <div className="tips-text">{languages.getTranslation('update-failed-text')}</div>
          <div className="btn" {...tapOrClick(this.openShowProgressDialog)}>{languages.getTranslation('update-retry-btn')}</div>
        </div>
      );
    case this.firmwareSteps.done:
      return (
        <div className="text-section">
          <h3 className="tips-title">{languages.getTranslation('update-done')}</h3>
          <div className="tips-text">{languages.getTranslation('update-done-text')}</div>
          <div className="btn" {...tapOrClick(this.closePanel)}>{languages.getTranslation('update-done-btn')}</div>
        </div>
      );
    }
  }

  openShowProgressDialog() {
    this.setState({
      firmwareStep:this.firmwareSteps.showProgress
    });
    let self = this;
    firmwareStore.on('updateBlockFirmwareResult', this.getUpdateBlockFirmwareResult);
    firmwareStore.on('nodeInitiativeDisconnect', this.showProgressDisconnect);
    setTimeout(function () {
      self.refs.progressLine.addEventListener('webkitAnimationEnd',function () {
        self.refs.progressLine.style.width = '99%';
      });
    }, 0);
    nodeStore.off('ElectronicNodesListChange', this.getFirstNodeNeedUpdate);

    UIActions.updateBlockISP(this.state.id);
  }

  showProgressDisconnect() {
    this.setState({
      firmwareStep: this.firmwareSteps.disconnected
    });
    firmwareStore.off('nodeInitiativeDisconnect', this.showProgressDisconnect);
    firmwareStore.on('NodeDisconnectReconnect', this.NodeDisconnectReconnect.bind(this));
  }
  
  NodeDisconnectReconnect() {
    this.setState({
      firmwareStep: this.firmwareSteps.showProgress
    });
    firmwareStore.on('nodeInitiativeDisconnect', this.showProgressDisconnect);
    firmwareStore.off('NodeDisconnectReconnect', this.NodeDisconnectReconnect.bind(this));
  }

  getUpdateBlockFirmwareResult() {
    let result = firmwareStore.getUpdateBlockFirmwareResult();

    //block will restart;
    setTimeout(function () {
      nodeStore.on('ElectronicNodesListChange', this.getFirstNodeNeedUpdate);
    },100);
    if(result === 1) {
      this.setState({
        firmwareStep: this.firmwareSteps.done
      });
      //update shelf
      setTimeout(function () {
        UIActions.syncUpdateFirmwareToShelf();
      },0);
    }else {
      this.setState({
        firmwareStep: this.firmwareSteps.updateFailed
      });
    }

    firmwareStore.off('nodeInitiativeDisconnect', this.showProgressDisconnect);
  }

  closePanel() {
    this.setState({
      isActive: false
    });
    nodeStore.off('ElectronicNodesListChange', this.getFirstNodeNeedUpdate);
  }

  communicationBlockDisconnect() {
    let wifiStatus = wifiStore.getConnectChosenWifiStatus();
    let bleStatus = linkStore.getStatus();
    if(this.state.connectedType === this.connectedTypes.wifi && wifiStatus === false) {
      this.setState({
        isActive: false
      });
    }
    if(this.state.connectedType === this.connectedTypes.ble && bleStatus !== 'connected') {
      this.setState({
        isActive: false
      });
    }
  }

  getFirstNodeNeedUpdate () {
    if(this.insertNodeCount || this.insertNodeCount === 0) {
      this.insertNodeCount += 1;
    }
    let nodes = nodeStore.getElectronicNodes();
    console.log(nodes);
    let node = '';
    if(nodes.length > 0) {
      node = nodes[0];
      
      //firstNode can update
      if(node && node.update === true) {
        this.setState({
          isActive: true,
          connectedType: this.connectedType,
          firmwareStep:this.firmwareSteps.readyUpdate,
          id: node.id,
          type: node.type
        });
      }

      //insertNode count more than 2
      else if(node && !node.update && this.insertNodeCount >2) {
        this.setState({
          isActive: true,
          connectedType: this.connectedType,
          firmwareStep: this.firmwareSteps.insertAnother,
          id: this.state.id || this.id,
          type: this.state.type || this.type
        });
      }
      //defaultStep
      else {
        this.setState({
          isActive: true,
          connectedType: this.connectedType,
          firmwareStep: this.firmwareSteps.beforeInsert,
          id: this.id,
          type: this.type
        });
      }
    }else {
      this.setState({
        isActive: true,
        connectedType: this.connectedType,
        firmwareStep: this.firmwareSteps.disconnected,
      });
    }
  }

  renderPop() {
    return (
      <div className="update-firmware-pop">
        {this.state.firmwareStep !== this.firmwareSteps.showProgress ? <img className="close-button" src="img/icon-closeBtn.png" alt="" {...tapOrClick(this.closePanel)}/> : ''}
        {this.showFirmWareSection()}
        {this.showTextSection()}
      </div>
    );
  }

  render() {
    return (<div className={'update-firmware-panel '+(this.state.isActive === true ? '' : 'hide')}>
      {this.state.isActive === true ? this.renderPop() : ''}
    </div>);

  }

  componentDidMount() {
    this._register = AppDispatcher.register((action) => {
      if (action.actionType == AppConstants.SHOW_UPDATE_FIRMWARE) {
        nodeStore.on('ElectronicNodesListChange', this.getFirstNodeNeedUpdate);
        //record insertNode count
        this.insertNodeCount = 0;
        this.id = action.id;
        this.type = action.type;
        this.connectedType = action.connectedType;
        this.getFirstNodeNeedUpdate();
      }
    });

    //bluetooth
    linkStore.on('statusChange', this.communicationBlockDisconnect);
    //wifi
    wifiStore.on('wifiConnected', this.communicationBlockDisconnect);
  }

  componentWillUnmount() {
    AppDispatcher.unregister(this._register);

    //bluetooth
    linkStore.off('statusChange', this.communicationBlockDisconnect);
    //wifi
    wifiStore.off('wifiConnected', this.communicationBlockDisconnect);
  }
}

export {UpdateFirmware};
