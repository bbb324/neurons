import languages from '../languages';

function isParent(obj, parentObj) {
  while (obj != undefined && obj != null && obj.tagName.toUpperCase() != 'BODY') {
    if (obj == parentObj) {
      return true;
    }
    obj = obj.parentNode;
  }
  return false;
}
let isSupportTouch = 'ontouchend' in document ? true : false;

let pressup = isSupportTouch ? 'touchend' : 'mouseup';
let pressdown = isSupportTouch ? 'touchstart' : 'mousedown';
let tap = isSupportTouch ? 'touchend' : 'click';

function parseValue(bundle) {
  let value;
  let nodeId = bundle.id;

  if (nodeId.indexOf('TODAY') != -1 || nodeId.indexOf('NOW') != -1) {
    switch (bundle.port) {
    case 'month':
      value = languages.getTranslation('month') + ' ' + bundle.value;
      break;
    case 'day':
      value = languages.getTranslation('day') + ' ' + bundle.value;
      break;
    case 'week':
      value = languages.getTranslation('week') + ' ' + bundle.value;
      break;
    case 'hour':
      value = languages.getTranslation('hour') + ' ' + bundle.value;
      break;
    case 'minute':
      value = languages.getTranslation('minute') + ' ' + bundle.value;
      break;
    case 'second':
      value = languages.getTranslation('second') + ' ' + bundle.value;
      break;
    default:
      value = bundle.value;
      break;
    }
  } else if (nodeId.indexOf('RGBMIX') !== -1) {
    value = (bundle.value !== null ? Math.floor(bundle.value) : 0);
  } else {
    value = bundle.value;
  }

  return value;
}

function setElementStyleShrink(DOM) {
  let height = setWindowHeight();
  if(height <= 600) {
    let parent = DOM.parentNode;
    if(parent && parent.classList.contains('ReactModal__Content')) {
      parent.style.transform = 'scale(0.7)';
    }
  }
}

function setWindowHeight() {
  let height = window.screen.width > window.screen.height ? window.screen.height : window.screen.width;
  return height;
}

export { isParent, pressdown, pressup, tap, parseValue, setElementStyleShrink ,setWindowHeight };