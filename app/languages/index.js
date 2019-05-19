let language = 'en-us';
const DEFAULT_LANG = 'en-us';

exports.getTranslation = function(key) {
  language = navigator.language.toLowerCase();
  if(language == 'zh-tw') {
    language = 'zh-cn';
  }
  else if(language !== 'zh-cn') {
    language = DEFAULT_LANG;
  }
  //let defaultPkg = require('./' + DEFAULT_LANG);
  let pkg = require('./' + language) ;
  return pkg[key] ;
};