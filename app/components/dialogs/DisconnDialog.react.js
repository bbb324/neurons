import React, { Component } from 'react';
import AppDispatcher from '../../dispatcher/AppDispatcher';
import AppConstants from '../../constants/AppConstants';
import UIActions from '../../actions/UIActions';
import Modal from 'react-modal';
import languages from '../../languages';
import tapOrClick from '../../utils/tapOrClick';

require('./DisconnDialog.less');


class DisconnDialog extends Component {
  constructor() {
    super(...arguments);
    this._disconnType = ''; // ble wifi
    this.state = {
      modalIsOpen: false,
      rerender: false
    };
  }

  openModal() {
    this.setState({modalIsOpen: true});
  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }

  renderDialogHeader() {
    // let self = this;
    let headerTips = '';
    return headerTips;
  }

  confirm() {
    let self = this;
    console.log('confirm');
    if(self._disconnType == 'wifi') {
      UIActions.disconnWifi();
    } else if(self._disconnType == 'ble') {
      UIActions.disconnectLinkDevice(false);
    }
    self.setState({modalIsOpen: false});
  }

  renderDialogBody() {
    let self = this;
    let bodyTips = '';
    let typeTips = languages.getTranslation('bluetooth');
    let pngTips = 'img/ble-disconnect.png';
    if(self._disconnType == 'wifi') {
      pngTips = 'img/wifi-disconnect.png';
    }
    if(self._disconnType == 'wifi') {
      typeTips = 'wifi';
    }
    bodyTips = (
      <div className='disconn-panel'>
        <img className='disconn-icon' src={pngTips} />
        <div className='title'>{languages.getTranslation('disconnect-text')}</div>
        <div className='text'>{languages.getTranslation('conform-disconnect')} {typeTips} {languages.getTranslation('connection')}?</div>
        
      </div>
    );
    return bodyTips;
  }

  renderDialogFooter() {
    let self = this;
    let footerTips = '';
    footerTips = (
      <div className='disconn-button-set'>
        <div className="cancel" {...tapOrClick(self.closeModal.bind(self))} >{languages.getTranslation('icon-cancel')}</div>
        <div className="confirm" {...tapOrClick(self.confirm.bind(self))} >{languages.getTranslation('icon-confirm-ok')}</div>
      </div>
    );
    return footerTips;
  }

  render() {
    let self = this;
    return (
      <Modal
        isOpen={this.state.modalIsOpen}
        onAfterOpen={this.afterOpenModal}
        onRequestClose={this.closeModal}
        className="DisconnDialog dialog " 
        contentLabel="DisconnDialogModal"
        overlayClassName="dialog-overlay">
        <div className="dialog-container">
          <div className="dialog-header">
            {self.renderDialogHeader()}
          </div>
          <div className="dialog-body">
            {self.renderDialogBody()}
          </div>
          <div className="dialog-footer" ref="footer">
            {self.renderDialogFooter()}
          </div>
        </div>
      </Modal>
    );
  }

  
 

  componentDidMount() {
    let self = this;
    self.callbackDispatcher = AppDispatcher.register((action) => {

      if (action.actionType == AppConstants.OPEN_DISCONN_DIALOG) {
        console.log('openning disconn dialog');
        self._disconnType = action.type;
        self.setState({
          modalIsOpen: true
        });
        
      }

    });

    
   
  }

  componentWillUnmount() {
    let self = this;
    AppDispatcher.unregister(self.callbackDispatcher);
  }
}

export { DisconnDialog};
