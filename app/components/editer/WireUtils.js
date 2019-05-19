import { TouchHandler } from './TouchHandler';
let WireUtils = {};

WireUtils.findWiresBySource = function (sourceNodeId, sourcePort) {
  return document.querySelectorAll('.editer-wire[data-source-port="' + sourceNodeId + '-' + sourcePort + '"]');
};

WireUtils.highlightWire = function (svg, flag) {
  let tmpPath = svg.querySelector('path.path-inner');
  if( !flag ) {
    tmpPath.classList.add('highlight');
  } else {
    tmpPath.classList.remove('highlight');
  }
};

WireUtils.dashWire = function (svg, flag) {
  let tmpPath = svg.querySelector('path.path-inner');
  if(flag) {
    tmpPath.classList.add('dashed');
  } else {
    tmpPath.classList.remove('dashed');
  }
};

WireUtils.drawWire = function(initX, initY, X, Y, svg) {
  let startX = parseInt(initX);
  let startY = parseInt(initY);
  let pathInner = svg.querySelector('.path-inner');
  let pathCover = svg.querySelector('.path-cover');
  let deleteX = svg.querySelector('div');
  let line;

  let distX = parseInt(X-initX);
  let distY = parseInt(Y-initY);
  let svgPadding = 6;
  let svgOffset = 2 * svgPadding;
  let lineWidth = '4';   // the real wire width
  let lineTouchArea = '32';  // use to set touch width to handle wire

  let style = 'position: absolute; display: block;';

  if(deleteX) {
    deleteX.style.background = 'url("img/icon-delete.svg") no-repeat center';
  }

  if (distY <= 0 && distX >= 0) {
    // todo drag line x>0, y<0
    let absY = Math.abs(distY);
    style += 'left: ' + (startX - svgPadding) + 'px;' +
    'top: ' + (startY + distY - svgPadding) + 'px;' +
    'width:' + (distX+svgOffset)+ 'px;' +
    'height:' + (absY+svgOffset) + 'px';
    line = 'M ' + 0 + ' ' + absY + ' L ' + distX + ' ' + 0;

  } else if (distY >= 0 && distX <= 0) {
    // todo drag line x<0, y>0
    let absX = Math.abs(distX);
    style += 'left: ' + (startX + distX - svgPadding) + 'px;' +
    'top: ' + (startY-svgPadding) + 'px;' +
    'width:' + (absX+svgOffset) + 'px;' +
    'height:' + (distY+svgOffset) + 'px';
    line = 'M ' + absX + ' ' + 0 + ' L ' + 0 + ' ' + distY;

  } else if (distY <= 0 && distX <= 0) {
    // todo drag line x<0, y<0
    let absX = Math.abs(distX);
    let absY = Math.abs(distY);
    style += 'left: ' + (startX + distX - svgPadding) + 'px;' +
    'top: ' + (startY + distY - svgPadding) + 'px;' +
    'width:' + (absX+svgOffset) + 'px;' +
    'height:' + (absY+svgOffset) + 'px';
    line = 'M ' + 0 + ' ' + 0 + ' L ' + absX + ' ' + absY;

  } else {
    // X>=0, Y>=0
    style += 'left: ' + (startX-svgPadding) + 'px;' +
    'top: ' + (startY-svgPadding) + 'px;' +
    'width:' + (distX+svgOffset) + 'px;' +
    'height:' + (distY+svgOffset) + 'px';
    line = 'M ' + 0 + ' ' + 0 + ' L ' + distX + ' ' + distY;
  }

  pathInner.setAttributeNS(null, 'd', line);
  pathInner.setAttributeNS(null, 'stroke', '#9CA6B3');
  pathInner.setAttributeNS(null, 'stroke-width', lineWidth);
  pathInner.setAttributeNS(null, 'fill', 'none');
  pathInner.setAttributeNS(null, 'version', '1.1');
  pathInner.setAttributeNS(null, 'transform', 'translate(' + svgPadding + ',' + svgPadding + ')');
  pathInner.setAttributeNS(null, 'pointer-events', 'visibleStroke');

  pathCover.setAttributeNS(null, 'transform', 'translate(' + svgPadding + ',' + svgPadding + ')');
  pathCover.setAttributeNS(null, 'stroke-width', lineTouchArea);
  pathCover.setAttributeNS(null, 'fill', 'none');
  pathCover.setAttributeNS(null, 'd', line);
  svg.setAttributeNS(null, 'style', style);
};

WireUtils._createElementNS = function (ns, tag, style, clazz, atts) {
  var e = ns == null ? document.createElement(tag) : document.createElementNS(ns, tag);
  var i;
  style = style || {};
  for (i in style)
    e.style[i] = style[i];

  if (clazz)
    e.class = clazz;

  atts = atts || {};
  for (i in atts)
    e.setAttribute(i, '' + atts[i]);

  return e;
};


WireUtils.createSvg = function (wireInfo) {
  let ns = {
    svg: 'http://www.w3.org/2000/svg',
    xhtml: 'http://www.w3.org/1999/xhtml'
  };
  let attributes = {
    version: '1.1',
    xmlns: ns.xhtml
  };

  let objAttr = {
    x: '50%',
    y: '50%'
  };

  let newsvg = this._createElementNS(ns.svg, 'svg', null, null, attributes);
  let realPath = this._createElementNS(ns.svg, 'path', null, null, attributes);    // the real display wire
  let pathCover = this._createElementNS(ns.svg, 'path', null, null, attributes); // use to enlarge wire touch area
  let foreignObject = this._createElementNS(ns.svg, 'foreignObject', null, 'deleteBtn', objAttr); // the delete image carrier
  let div = this._createElementNS(ns.xhtml, 'div', null, 'deleteBtn', null);  // the delete image
    
  newsvg.setAttributeNS(null, 'class', 'editer-wire '+wireInfo);
  newsvg.setAttributeNS(null, 'id', wireInfo);
  realPath.setAttributeNS(null, 'class', 'path-inner');
  pathCover.setAttributeNS(null, 'class', 'path-cover');
  foreignObject.setAttributeNS(null, 'id', wireInfo);
  div.setAttributeNS(null, 'class', 'hide deleteBtn');

  foreignObject.appendChild(div);
  newsvg.appendChild(pathCover);
  newsvg.appendChild(realPath);
  newsvg.appendChild(foreignObject);
  return newsvg;
};


WireUtils.setWireInfo = function(newSvg, sourceNodeId, sourcePortId, targetNodeId, targetPortId) {
  newSvg.setAttributeNS(null, 'data-source-node', sourceNodeId);
  newSvg.setAttributeNS(null, 'data-source-port', sourcePortId);
  newSvg.setAttributeNS(null, 'data-target-node', targetNodeId);
  newSvg.setAttributeNS(null, 'data-target-port', targetPortId);
};
WireUtils.setWirePosition = function(wires, canvasStatus) {
  if (wires == undefined) return;
  let startPortCenter, endPortCenter;
  wires.forEach(wire=>{
    let wireSet = wire.split('&');
    let sourcePort = wireSet[1];
    let targetPort = wireSet[3];
    startPortCenter = new TouchHandler()._getPortCenter(document.getElementById(sourcePort), canvasStatus);
    endPortCenter = new TouchHandler()._getPortCenter(document.getElementById(targetPort), canvasStatus);
    this.drawWire(startPortCenter[0], startPortCenter[1], endPortCenter[0], endPortCenter[1], document.getElementById(wire));
  });
};


export { WireUtils };