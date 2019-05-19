class TouchHandler {
  constructor(container) {
    this.container = container;
    this.touchX = 0;
    this.touchY = 0;
  }

  _touches(e) {
    return e.touches && e.touches.length > 0 ? e.touches :
      e.changedTouches && e.changedTouches.length > 0 ? e.changedTouches :
        e.targetTouches && e.targetTouches.length > 0 ? e.targetTouches :
          [e];
  }

  _fingers(e) {
    return this._touches(e).length || 0;
  }

  _getOffsetRect(elem) {
    let box = elem.getBoundingClientRect();
    let body = document.body;
    let docElem = document.documentElement;
    let scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
    let scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
    let clientTop = docElem.clientTop || body.clientTop || 0;
    let clientLeft = docElem.clientLeft || body.clientLeft || 0;
    let top = box.top + scrollTop - clientTop;
    let left = box.left + scrollLeft - clientLeft;

    return {top: Math.round(top), left: Math.round(left)};
  }

  _distance(touches) {
    return this._d(touches[0].pageX, touches[0].pageY, touches[1].pageX, touches[1].pageY);
  }

  _getCenter(touches) {
    return [ ( touches[0].pageX + touches[1].pageX) / 2, (touches[0].pageY + touches[1].pageY) / 2 ];
  }
  _d (x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  _getPosition(xy, obj){
    return [(xy[0]-obj.left)/obj.zoom, (xy[1]-obj.top)/obj.zoom];
  }

  _getPortCenter(ele, canvasStatus) {
    if (ele == null) return;
    let info = ele.getBoundingClientRect();
    let x = parseFloat(info.left+info.width/2);
    let y = parseFloat(info.top+info.height/2);
    let xy = [x, y], obj;
    if(canvasStatus!=undefined) {
      obj = canvasStatus;
    } else {
      obj = {left: this.container.state.left,
        top: this.container.state.top,
        zoom: this.container.state.zoom};
    }
    xy = this._getPosition(xy, obj);
    return (xy);
  }

  _showDeleteTips(_category, _show) {
    this.container.emitter.emit('showDelete', {category: _category, showDelete: _show});
  }

}

export { TouchHandler };