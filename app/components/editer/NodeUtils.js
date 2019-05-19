let NodeUtils = {};
let lastHighlight = {node: '', port: ''};
NodeUtils.addEnlarge = function (source) {
  let enLargeSet, shrinkSet, enlargeList = [], shrinkList = [], portType, total = {enlargedList: [], shrinkedList: []};
  if (source.dataset.type == 'output') {
    enLargeSet = document.querySelectorAll('[data-type="' + 'input' + '"]');
    shrinkSet = document.querySelectorAll('[data-type="' + 'output' + '"]');
    portType = 'input';
  } else {
    enLargeSet = document.querySelectorAll('[data-type="' + 'output' + '"]');
    shrinkSet = document.querySelectorAll('[data-type="' + 'input' + '"]');
    portType = 'output';
  }
  let sourcePorts = source.closest('.node-actual').querySelectorAll('[data-type="' + portType + '"]');
  if (enLargeSet.length != 0) {
    for (let i = 0; i < enLargeSet.length; i++) {
      if (enLargeSet[i].dataset.type != source.dataset.type) {
        if ([].indexOf.call(sourcePorts, enLargeSet[i])==-1) {  // loop self node ports, if do not contains need enlargePort, enlarge it
          enLargeSet[i].querySelector('.core').classList.add('enlarge-port');
          enlargeList.push(enLargeSet[i]);
        }
      }
    }
    for (let i = 0; i < shrinkSet.length; i++) {
      if (shrinkSet[i].dataset.type == source.dataset.type &&
        shrinkSet[i] != source) {
        shrinkSet[i].querySelector('.core').classList.add('shrink-port');
        shrinkList.push(shrinkSet[i]);
      }
    }
    total = {enlargedList: enlargeList, shrinkedList: shrinkList};
  }
  return total;
};

//when port connection enlarge node and port, change port backgroundColor
NodeUtils.enlargeNode = function (node, port, wire) {
  if(lastHighlight.node!=node && lastHighlight.node!= ''){
    //lastHighlight.node.querySelector('.node-body').classList.remove('highlight-node');
    lastHighlight.port.querySelector('.core').classList.remove('highlight-port');
    lastHighlight.node.classList.remove('top-most');
  }
  //node.querySelector('.node-body').classList.add('highlight-node');
  node.classList.add('top-most');
  let cores = node.querySelectorAll('.core');
  let curPort = port.querySelector('.core');
  for (let i=0; i<cores.length; i++) {
    if (cores[i].classList.contains('highlight-port')) {
      cores[i].classList.remove('highlight-port');
    }
  }
  curPort.classList.add('highlight-port');
  lastHighlight.port = port;
  lastHighlight.node = node;
  wire.querySelector('.path-inner').classList.add('highlight-wire');
  return {node: node, port: port};
  
};

//when using auto connection, if can connect, add style
NodeUtils.singlePortEnlarge = function (node, port) {
 // node.querySelector('.node-body').classList.add('highlight-node');
  node.classList.add('top-most');
  port.querySelector('.core').classList.add('enlarge-port');
  port.querySelector('.core').classList.add('highlight-port');
};

//when using auto connection, after connect, clear style
NodeUtils.clearNodeToNodeConnection = function (node, port) {
  node.classList.remove('top-most');
  NodeUtils._removeEnlargeStatus(node, port);
};

//when delete
NodeUtils.addDragDelete = function (node) {
  node.querySelector('.node-body').classList.add('delete-node');
};

NodeUtils.removeDragDelete = function (node) {
  node.querySelector('.node-body').classList.remove('delete-node');
};

//when connect through port, after connection, clear connected node style
NodeUtils.clearHighlightNode = function (node, port, wire) {
  //node.querySelector('.node-body').classList.remove('highlight-node');
  if(node) {
    node.classList.remove('top-most');
    let curPort = node.querySelectorAll('[data-type="' + port.dataset.type + '"]');
    for(let i=0; i<curPort.length; i++){
      curPort[i].querySelector('.core').classList.remove('highlight-port');
    }
  }
  wire.querySelector('.path-inner').classList.remove('highlight-wire');
};


//when connect through port, after connection, clear all enlarged port and shrinked port style
NodeUtils.clearEnlargedPort = function (enlargedList, shrinkedList) {
  for (let i = 0; i < enlargedList.length; i++) {
    enlargedList[i].querySelector('.core').classList.remove('enlarge-port');
  }
  for (let i = 0; i < shrinkedList.length; i++) {
    shrinkedList[i].querySelector('.core').classList.remove('shrink-port');
  }
};

// if autoConnect, and then switch ports, clear lastHighlight port style
NodeUtils.portSwitch = function (node, port, wire) {
  if(lastHighlight.node!='')
  {
    //lastHighlight.node.querySelector('.node-body').classList.remove('highlight-node');
    lastHighlight.port.querySelector('.core').classList.remove('highlight-port');
    lastHighlight.port.querySelector('.core').classList.remove('enlarge-port');
  }
  if (lastHighlight.port != port) {
    lastHighlight.port = port;
    lastHighlight.node = node;
    NodeUtils._removeEnlargeStatus(node, port);
    wire.querySelector('.path-inner').classList.remove('highlight-wire');
  }
};

// if autoconnect, and then leave, clear style
NodeUtils.clearNodeStatus = function (node, port) {
  if(node != null && port != null)
  {
    NodeUtils._removeEnlargeStatus(node, port);
  }
};


NodeUtils._removeEnlargeStatus = function (node, port) {
  //node.querySelector('.node-body').classList.remove('highlight-node');
  node.classList.remove('top-most');
  let curPort = node.querySelectorAll('[data-type="' + port.dataset.type + '"]');
  for(let i=0; i<curPort.length; i++) {
    curPort[i].querySelector('.core').classList.remove('highlight-port');
    curPort[i].querySelector('.core').classList.remove('enlarge-port');  // if is connected, remove enlarge effect
  }
};



export { NodeUtils };