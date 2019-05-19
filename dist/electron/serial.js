const SerialPort = require('serialport');
const listPorts = require('serialport').list;
const {
  ipcMain
} = require('electron');

const BAUDRATE = 115200;
let serialName = '';
let serialPort = null;
let sender = null;

function checkConnection(err) {
  console.log(err.message);
  if (err && (err.message.indexOf('not open') > 0)) {
    console.warn('serial connection lost.');
    serialName = '';
    serialPort = null;
    initSerial();
  }
}

function initSerial() {
  if (serialName === '') {
    // find serial available serial port
    listPorts(function(err, ports) {
      //for PC and raspberry pi
      ports.forEach(function(port) {
        var name = port.comName;
        var NAME = name.toUpperCase();
        if (NAME.indexOf('USB') > 0 || (NAME.indexOf('COM') == 0 && port.pnpId.indexOf('USB') == 0)) {
          console.log('serial port found:', name);
          serialName = name;
          return;
        }
      });

      if (serialPort === null && serialName !== '') {

        serialPort = new SerialPort(serialName, {
          baudrate: BAUDRATE
        });

        serialPort.on('open', function() {
          console.info('serial opened: ', serialName);

          if (serialPort && serialPort.isOpen() ) {
          serialPort.on('data', function(data) {
            console.log('serial data received: ' + data);

            if(sender) {
              sender.send('serial-data', data);
            }
          });

          serialPort.on('error', function(err) {
            console.warn('serial port error ' + err);
            checkConnection(err);
          });
          }
        });
      }
    });
  }

}

ipcMain.on('serial-send', (event, arg) => {
  sender = event.sender;

  if (serialPort === null) {
    initSerial();
    return -1;
  }

  serialPort.write(arg, function(err, results) {
    if (err) {
      console.warn(err);
      checkConnection(err);
      return -1;
    }
    console.log('serial write buffer: ', arg, results, err);
  });
});

ipcMain.on('serial-close', (event, arg) => {
  if (serialPort && serialPort.isOpen() ) {
    serialPort.close();
  }
});

module.exports = SerialPort;
