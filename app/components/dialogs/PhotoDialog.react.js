import React, { Component } from 'react';
import AppDispatcher from '../../dispatcher/AppDispatcher';
import AppConstants from '../../constants/AppConstants';
import Modal from 'react-modal';
import tapOrClick from '../../utils/tapOrClick';

require('./PhotoDialog.less');

class PhotoDialog extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      modalIsOpen: false,
      src: '',
    };
    this.closeModal = this.closeModal.bind(this);
  }

  openModal() {
    this.setState({modalIsOpen: true});
  }

  closeModal() {
    this.setState({modalIsOpen: false, src: ''});
  }

  render() {
    let self = this;
    return (
      <Modal
        contentLabel="photo-dialog"
        isOpen={self.state.modalIsOpen}
        className="dialog photo-dialog"
        shouldCloseOnOverlayClick={true}
        overlayClassName="dialog-overlay">
        <div className="dialog-container" ref="container" {...tapOrClick(self.closeModal)} >
          <img src={this.state.src}/>
        </div>
      </Modal>
    );
  }

  componentDidMount() {
    let self = this;
    this.AppDispatcherHandle = AppDispatcher.register((action) => {
      if (action.actionType == AppConstants.PHOTO_DIALOG_OPEN) {
        console.log('openning photo view dialog');
        self.setState({
          modalIsOpen: true,
          src: action.src,
        });

        //refs container is undefined
        setTimeout(function () {
          self.refs.container.closest('.dialog-overlay').addEventListener('touchend', self.closeModal, false);
        },0);
      }
    });
  }

  componentWillUnmount() {
    AppDispatcher.unregister( this.AppDispatcherHandle );
  }

}

export { PhotoDialog };