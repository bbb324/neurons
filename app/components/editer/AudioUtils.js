let AudioUtils = {};

AudioUtils.CONNECT = 'connectAudio.wav';
AudioUtils.DISCONNECT = 'disconnectAudio.wav';

AudioUtils._lastSound = '';
AudioUtils._audio = null;
AudioUtils._currentTime = 0;
AudioUtils._lastTime = 0;

AudioUtils.play = function (audioSrc) {
  AudioUtils._currentTime = new Date().getTime();
  // let audio = document.getElementById('audio-id'); 
  if(AudioUtils._audio == null) {
    AudioUtils._audio = document.createElement('audio');
    AudioUtils._audio.id = 'audio-id';
    AudioUtils._audio.preload = 'auto';
    AudioUtils._audio.src = './audio/' + audioSrc;
    document.body.appendChild(AudioUtils._audio);
  }

  if(AudioUtils._currentTime - AudioUtils._lastTime < 100) {
    return;
  }
  AudioUtils._lastTime = AudioUtils._currentTime;

  if(AudioUtils._lastSound != audioSrc) {
    AudioUtils._audio.src = './audio/' + audioSrc;
    //AudioUtils._lastSound = AudioUtils._audio.src;
    AudioUtils._lastSound = audioSrc;
  }
  
  AudioUtils._audio.currentTime = 0;
  AudioUtils._audio.play();

};


export { AudioUtils };