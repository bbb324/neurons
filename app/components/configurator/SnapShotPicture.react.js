/**
 * Created by junxie on 17/4/11.
 */
import React, { PureComponent } from 'react';
import engine from '../../core/FlowEngine';
import AppDispatcher from '../../dispatcher/AppDispatcher';
import AppConstants from '../../constants/AppConstants';
import languages from '../../languages';
import tapOrClick from 'react-tap-or-click';
require('./Configurator.less');

class SnapShotPicture extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {
      src: '',
      noImage: false
    };
  }

  onSnapshot(){
    this.props.onChange && this.props.onChange('snapshot', true);   
  }

  snapshotCallback(){
    let self =  this;
    self.setState({
      src: 'http://'+engine.getWifiServerIp()+':8083/viewPhoto?'+new Date().getTime()+'&filename=' + self.props.id + '.jpg'
    });
  }

  render(){
    return (
      <div className='picture-check' ref='viewer'>
        <div className={'no-image '+(this.state.noImage==true?'':'hide')}>{languages.getTranslation('no-photos')}</div>
        <img className={'img-frame'} src={this.state.src} ref='img' alt='no image'/>
        <div className={'click-to-snapshot ' +(this.state.noImage==true?'':'width-to-320')} {...tapOrClick(this.onSnapshot.bind(this))}>{languages.getTranslation('click-to-snapshot')}</div>
      </div>
    );
  }

  componentDidMount() {
    let self = this;
    for ( let key in this.props.configs){
      if (this.props.configs[key].hasOwnProperty('defaultValue')){
        this.props.onChange && this.props.onChange( key, this.props.configs[key].defaultValue);
      }
    }
    if(this.refs.img) {
      this.refs.img.onerror = function () {
        self.refs.viewer.classList.add('no-image-div');
        self.refs.img.classList.add('no-image');
        self.setState({
          noImage: true
        });
      };
      this.refs.img.onload = function () {
        if (self.refs.img.complete) {
          self.refs.viewer.classList.remove('no-image-div');
          self.refs.img.classList.remove('no-image');
          self.refs.viewer.closest('.node-config').style.width = '340px';
          self.refs.viewer.closest('.node-config').style.height = '310px';
          self.refs.viewer.closest('.node-config').querySelector('.confirm').style.width = '320px';
          self.setState({
            noImage: false
          });
        }
      };
    }
    this._register = AppDispatcher.register((action) => {
      if (action.actionType == AppConstants.NODE_TAP) {
        if(this.props.id == action.nodeId) {
          setTimeout(() => {
            let value = '';
            if (self.props.isActive == true) {
              value = 'http://' + engine.getWifiServerIp() + ':8083/viewPhoto?' + new Date().getTime() + '&filename=' + self.props.id + '.jpg';
            }
            self.setState({
              src: value
            });
          },0);
        }
      }
    });
    engine.callMethod(self.props.id, 'reportSnapshot', self.snapshotCallback.bind(this));   
  }

  componentWillUnmount() {
    if(this.refs.img){
      this.refs.img.onerror = null;
      this.refs.img.onload = null;
    }
    AppDispatcher.unregister(this._register);
  }

}

export { SnapShotPicture };