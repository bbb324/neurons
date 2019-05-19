function getCompareIconUrl(operator,active){
  let url;
  switch (operator) {
  case '>':
    url = (active===true?'./img/compare/icon-larger-active.png':'./img/compare/icon-larger.png');
    break;
  case '>=':
    url = (active===true?'./img/compare/icon-larger-eq-active.png':'./img/compare/icon-larger-eq.png');
    break;
  case '<':
    url = (active===true?'./img/compare/icon-smaller-active.png':'./img/compare/icon-smaller.png');
    break;
  case '<=':
    url = (active===true?'./img/compare/icon-smaller-eq-active.png':'./img/compare/icon-smaller-eq.png');
    break;
  case '=':
    url = (active===true?'./img/compare/icon-equal-active.png':'./img/compare/icon-equal.png');
    break;
  case '!=':
    url = (active===true?'./img/compare/icon-not-eq-active.png':'./img/compare/icon-not-eq.png');
    break;
  }
  return url;  
}

function getComputeIconUrl(operator,active){
  let url;
  switch (operator) {
  case '+':
    url = (active===true?'./img/compute/icon-addition-active.png':'./img/compute/icon-addition.png');
    break;
  case '-':
    url = (active===true?'./img/compute/icon-subtract-active.png':'./img/compute/icon-subtract.png');
    break;   
  case '*':
    url = (active===true?'./img/compute/icon-multiply-active.png':'./img/compute/icon-multiply.png');
    break;
  case '/':
    url = (active===true?'./img/compute/icon-divide-active.png':'./img/compute/icon-divide.png');
    break;   
  case '%':
    url = (active===true?'./img/compute/icon-mod-active.png':'./img/compute/icon-mod.png');
    break;           
  }
  return url;  
}

function getTextIconUrl(iconId){
  let url;
  switch (iconId) {
  case 'air':
    url = './img/textIcon/text-icon-air.png';
    break;
  case 'checkmark':
    url = './img/textIcon/text-icon-checkmark.png';
    break;
  case 'cloud':
    url = './img/textIcon/text-icon-cloud.png';
    break;
  case 'heart':
    url = './img/textIcon/text-icon-heart.png';
    break;
  case 'moon':
    url = './img/textIcon/text-icon-moon.png';
    break;
  case 'rain':
    url = './img/textIcon/text-icon-rain.png';
    break;     
  case 'rotate':
    url = './img/textIcon/text-icon-rotate.png';
    break;
  case 'ruler':
    url = './img/textIcon/text-icon-ruler.png';
    break;
  case 'running':
    url = './img/textIcon/text-icon-running.png';
    break;     
  case 'smile':
    url = './img/textIcon/text-icon-smile.png';
    break;
  case 'snow':
    url = './img/textIcon/text-icon-snow.png';
    break;
  case 'sun':
    url = './img/textIcon/text-icon-sun.png';
    break;        
  case 'temperature':
    url = './img/textIcon/text-icon-temperature.png';
    break;
  case 'water':
    url = './img/textIcon/text-icon-water.png';
    break;            
  }
  return url;
}

function getEmotionTestUrl(emotionValue) {
  let url;
  switch (emotionValue) {
  case 'happiness':
    url = './img/emotion/icon-happiness.png';
    break;
  case 'anger':
    url = './img/emotion/icon-anger.png';
    break;
  case 'sadness':
    url = './img/emotion/icon-sadness.png';
    break;
  case 'fear':
    url = './img/emotion/icon-fear.png';
    break;
  case 'surprise':
    url = './img/emotion/icon-surprise.png';
    break;
  }
  return url;
}

export { getCompareIconUrl, getTextIconUrl, getComputeIconUrl, getEmotionTestUrl };