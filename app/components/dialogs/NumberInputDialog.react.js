import React, { Component } from 'react';
import AppDispatcher from '../../dispatcher/AppDispatcher';
import AppConstants from '../../constants/AppConstants';
import Modal from 'react-modal';
import tapOrClick from '../../utils/tapOrClick';
import languages from '../../languages';

require('./NumberInputDialog.less');

const MAX_NUMBER_LENGTH = 7;

class NumberInputDialog extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      modalIsOpen: false,
      number: '0',
      callback: null
    };
  }

  openModal() {
    this.setState({modalIsOpen: true});
  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }

  onKeyPressed(e) {
    let self = this;
    let key = e.currentTarget.dataset.key;
    let num = self.state.number;
    let numStr = num + '';
    switch (key) {
    case 'clear':
      num = '0';
      break;
    case 'backspace':
      if(numStr.length > 1){
        numStr = numStr.substr(0, numStr.length - 1);
        if(numStr != '-') {
          num = Number(numStr);
        } else {
          num = '-';
        }
      } else {
        numStr = '0';
        num = Number(numStr);
      }
      
      break;
    case '.':
      if(numStr.indexOf('.') == -1 && numStr.length < MAX_NUMBER_LENGTH) {
        num = numStr + key;
      }
      break;
    case '0':
      if(numStr != '0' && numStr.length < MAX_NUMBER_LENGTH) {
        num = numStr + key;
      }
      break;
    case '-':
      num = - Number(numStr);
      if (isNaN(num)) {
        num = '0';
      } else if (num == 0) {
        num = '-';
      }

      break;
    case 'cancel':
      self.closeModal();
      break;
    case 'confirm':
      if(self.state.callback){
        let tmp = parseFloat(numStr);
        if (isNaN(tmp)) {
          self.state.callback(1);
        } else {
          self.state.callback(tmp);
        }
      }
      self.closeModal();
      break;
    default: 
      if(numStr.length < MAX_NUMBER_LENGTH) {
        numStr += key;
        num = Number(numStr);
      }
      break;
    }
    self.setState({
      number: num
    });
    if (numStr.length <= 8) {
      document.querySelector('.number-input-display').scrollLeft = 0;
    } else if(numStr.length > 8) {
      // $('.number-input-display').scrollLeft = 10000;
      if(key == '-') {
        document.querySelector('.number-input-display').scrollLeft = 0;
      } else {
        document.querySelector('.number-input-display').scrollLeft += 10000;
      }
    }
    
  }

  render() {
    let self = this;
    return (
      <Modal
        contentLabel="number-input-dialog"
        isOpen={self.state.modalIsOpen}
        className="number-input-dialog"
        overlayClassName="dialog-overlay">
        <div className="dialog-container" ref="container">
          <span className="number-input-display">{self.state.number}</span>
          <div className='key-board'>
            <ul className="number-input-keyboard">
              <li className="number-input-key" data-key="1" {...tapOrClick(self.onKeyPressed.bind(self))}>1</li>
              <li className="number-input-key" data-key="2" {...tapOrClick(self.onKeyPressed.bind(self))}>2</li>
              <li className="number-input-key" data-key="3" {...tapOrClick(self.onKeyPressed.bind(self))}>3</li>
              <li className="number-input-key" data-key="4" {...tapOrClick(self.onKeyPressed.bind(self))}>4</li>
              <li className="number-input-key" data-key="5" {...tapOrClick(self.onKeyPressed.bind(self))}>5</li>
              <li className="number-input-key" data-key="6" {...tapOrClick(self.onKeyPressed.bind(self))}>6</li>
              <li className="number-input-key" data-key="7" {...tapOrClick(self.onKeyPressed.bind(self))}>7</li>
              <li className="number-input-key" data-key="8" {...tapOrClick(self.onKeyPressed.bind(self))}>8</li>
              <li className="number-input-key" data-key="9" {...tapOrClick(self.onKeyPressed.bind(self))}>9</li>
              <li className="number-input-key" data-key="." {...tapOrClick(self.onKeyPressed.bind(self))}>·</li>
              <li className="number-input-key" data-key="0" {...tapOrClick(self.onKeyPressed.bind(self))}>0</li>
              <li className="number-input-key" data-key="-" {...tapOrClick(self.onKeyPressed.bind(self))}>-</li>
            </ul>
          </div>
          <div className='option'>
            <div className="number-input-key number-clear" data-key="clear" {...tapOrClick(self.onKeyPressed.bind(self))}>C</div>
            <div className="number-input-key number-space" data-key="backspace" {...tapOrClick(self.onKeyPressed.bind(self))}><i className="icon-cal-backspace-2"></i></div>
          </div>
          <div className='number-cancel' data-key='cancel' {...tapOrClick(self.onKeyPressed.bind(self))}>{languages.getTranslation('icon-cancel')}</div>
          <div className='number-confirm' data-key='confirm' {...tapOrClick(self.onKeyPressed.bind(self))}>{languages.getTranslation('icon-confirm-ok')}</div>
        </div>
      </Modal>
    );
  }

  componentDidMount() {
    let self = this;
    this.AppDispatcherHandle = AppDispatcher.register((action) => {
      if (action.actionType == AppConstants.NUMBER_INPUT_DIALOG_OPEN) {
        console.log('openning number input dialog');
        self.setState({
          modalIsOpen: true,
          number: '0',
          callback: action.callback
        });
      }
    });
  }

  componentWillUnmount() {
    AppDispatcher.unregister( this.AppDispatcherHandle );
  }

}

export { NumberInputDialog };