import languages from '../../../languages';
let factory = {
  COMPARE: [
   {key:'>', value:'./img/compare/icon-larger.png'},
   {key:'<', value:'./img/compare/icon-smaller.png'},
   {key:'>=', value:'./img/compare/icon-larger-eq.png'},
   {key:'<=', value:'./img/compare/icon-smaller-eq.png'},
   {key:'=', value:'./img/compare/icon-equal.png'},
   {key:'!=', value:'./img/compare/icon-not-eq.png'},
  ],
  COMPUTE: [
    {key:'+', value: './img/compute/icon-addition.png'},
    {key:'-', value: './img/compute/icon-subtract.png'},
    {key:'*', value: './img/compute/icon-multiply.png'},
    {key:'/', value: './img/compute/icon-divide.png'},
    {key:'%', value: './img/compute/icon-mod.png'},
  ],
  HOLD: [
    {key:'hold until change', value: languages.getTranslation('hold until change')},
    {key:'hold for time', value: languages.getTranslation('hold for time')},
    {key:'change slowly', value: languages.getTranslation('change slowly')}
  ],
  ROUND: [
    {key: 'round', value:languages.getTranslation('select-round')},
    {key: 'floor', value:languages.getTranslation('select-floor')},
    {key: 'ceil', value:languages.getTranslation('select-ceil')}
  ],
  FACE: [
    {key: 'angry', value: './img/face/face-angry.png'},
    {key: 'drowsy', value: './img/face/face-drowsy.png'},
    {key: 'enlarged', value: './img/face/face-enlarged.png'},
    {key: 'fixed', value: './img/face/face-fixed.png'},
    {key: 'happy', value: './img/face/face-happy.png'},
    {key: 'mini', value: './img/face/face-mini.png'},
    {key: 'normal', value: './img/face/face-normal.png'},
    {key: 'sad', value: './img/face/face-sad.png'}
  ],
  TEXT: [
    {key: 'none', value: './img/textIcon/text-icon-none.png'},
    {key: 'air', value: './img/textIcon/text-icon-air.png'},
    {key: 'checkmark', value: './img/textIcon/text-icon-checkmark.png'},
    {key: 'cloud', value: './img/textIcon/text-icon-cloud.png'},
    {key: 'heart', value: './img/textIcon/text-icon-heart.png'},
    {key: 'moon', value: './img/textIcon/text-icon-moon.png'},
    {key: 'rain', value: './img/textIcon/text-icon-rain.png'},
    {key: 'rotate', value: './img/textIcon/text-icon-rotate.png'},
    {key: 'ruler', value: './img/textIcon/text-icon-ruler.png'},
    {key: 'running', value: './img/textIcon/text-icon-running.png'},
    {key: 'smile', value: './img/textIcon/text-icon-smile.png'},
    {key: 'snow', value: './img/textIcon/text-icon-snow.png'},
    {key: 'sun', value: './img/textIcon/text-icon-sun.png'},
    {key: 'temperature', value: './img/textIcon/text-icon-temperature.png'},
    {key: 'water', value: './img/textIcon/text-icon-water.png'}
  ],
  COLOR: [
    {key: 1, value: '#d50022'},
    {key: 2, value: '#f8a443'},
    {key: 3, value: '#f8e653'},
    {key: 4, value: '#77d24b'},
    {key: 5, value: '#3ce3c4'},
    {key: 6, value: '#35619d'},
    {key: 7, value: '#9325f3'},
    {key: 0, value: '#d8d8d8'}
  ],
  ACCELEROMETER_GYRO: {
    type: [
      {key:'shake', value: 'shake'},
      {key:'angle', value: 'angle'},
      {key:'acceleration', value: 'acceleration'}
    ],
    axis: [
      {key:'X', value: 'X'},
      {key:'Y', value: 'Y'},
      {key:'Z', value: 'Z'}
    ]
  },
  EMOTION_TEST: [
    {key: 'happiness', value: './img/emotion/icon-happiness.png'},
    {key: 'anger', value: './img/emotion/icon-anger.png'},
    {key: 'sadness', value: './img/emotion/icon-sadness.png'},
    {key: 'fear', value: './img/emotion/icon-fear.png'},
    {key: 'surprise', value: './img/emotion/icon-surprise.png'}
  ]

};
export default factory;