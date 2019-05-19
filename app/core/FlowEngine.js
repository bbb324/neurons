let engine = null;
let driverType = '';
let _uuid = 'makeblockuuid';
let _device = 'ipad';

switch (window._runtime) {
case 'electron':
  driverType = 'electron';
  _uuid = new Date().getTime() + '_' + Math.round(Math.random() * 10000);
  _device = 'electron';
  break;
case 'cordova':
  driverType = 'cordovable';
  _uuid = device.uuid;
  _device = device.model;
  console.log('uuid:' + _uuid + ', device.model:' + device.model);
  break;
default:
  driverType = 'mock';
  break;
}

console.log('_uuid hello:' + _uuid + ',_runtime:' + window._runtime);
// console.log('random:' + Math.round(Math.random() * 100));

engine = createNeuronsFlowEngine({
  driver: driverType, 
  uuid: _uuid,
  device: _device
});

let userkey = 'e51b6fc18709b92cd4fa5a1c90357d670034768c1eee772ec71d63a0e300ae76';
// let uuid  = '76FA49A9-78D8-4AE5-82A3-EC960138E908';
engine.createIotClient(userkey, _uuid);


// export to browser for debugging
if (typeof window != 'undefined') {
  console.log('window');
  window.engine = engine;
}

function restartEngine() {
  engine.createWorkflow();
  return engine;
}

function engineGetUUID() {
  return _uuid;
}

function getDriverType() {
  return driverType;
}

if (engine == null) {
  restartEngine();
}
export default engine;
export { restartEngine };
export { engineGetUUID };
export { getDriverType };