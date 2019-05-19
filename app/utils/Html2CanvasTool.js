// function screenshot(callback) {
//   //html2canvas(document.body,
//   html2canvas(document.getElementById('editer-canvas-absolute'),
//     {allowTaint: true, taintTest: false, onrendered: function(canvas) {
//       //canvas.id = 'mycanvas';
//       let dataBase64 = canvas.toDataURL();    
//       return callback(dataBase64);
//     }
//     });
// }

function screenshot(div, callback) {
  html2canvas(div).then(function(canvas) {
   
    let dataBase64 = canvas.toDataURL();

    // console.log(dataBase64);
    return callback(dataBase64);
  });
}

export {screenshot};
