import EventEmitter from 'wolfy87-eventemitter';
import mqtt from 'mqtt';

// const APP_API_PREFIX = '/cloudapp/tests';  // for local ajax tests.
//const APP_API_PREFIX = '';
const DATA_API_PREFIX = 'http://iot.makeblock.com/data';

class AppStore extends EventEmitter {

  constructor() {
    super();
  }

  onProjectLoaded(data) {
    self.projectData = data;
    this.trigger('load');
    let settings = {username:'makeblockiot', password: 'makeiotblock'};
    this.client = mqtt.connect('mqtt://iot.makeblock.com:1884', settings);
    this.client.on('connect', this.onMQTTConnected.bind(this));
    this.client.on('message', this.onMQTTMessage.bind(this));
  }

  onMQTTConnected() {
    this.trigger('connect');
  }

  onMQTTMessage(topic, message) {
    console.log('received message:', topic, message.toString());
    this.trigger('message:' + topic, [message.toString()]);
  }

  publishMQTTMessage(topic, message) {

    this.client.publish(topic, message);
  }

  subscribeMQTTTopic(topic) {
    this.client.subscribe([topic]);
  }

  onHistoryData(topic, data) {
    console.log('received history data:', topic, data);
    this.trigger('history:' + topic, [data]);
  }

  getHistoryData(topic, limit) {
    limit = limit || 1;
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.open('GET', DATA_API_PREFIX + '/historydata?topic=' + topic + '&limit=' + limit, true);
    xmlhttp.send();
    let self = this;
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        let result = JSON.parse(xmlhttp.responseText);
        if (result.errCode != 0) {
          console.warn(result.errMsg);
          return;
        }
        if (result.datas) {
          self.onHistoryData(topic, result.datas.map(function(item){
            return item.data;
          }));
        }
      }
    };
  }

  isPreview() {
    return this.appId ? false: true;
  }
}

export default new AppStore();