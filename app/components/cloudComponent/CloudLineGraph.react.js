/**
 * Created by junxie on 2017/2/22.
 */

import React, { Component } from 'react';
import Chart from 'chart.js';
import nodeStore from '../../stores/nodeStore';
import appStore from '../../stores/AppStore';
import tapOrClick from 'react-tap-or-click';
import UIActions from '../../actions/UIActions';
require('./cloudStyle.less');

class CloudLineGraph extends Component{
  constructor(){
    super(...arguments);
    this.state = {
      id: this.props.id,
      name: this.props.name
    };
    this.labels = [];
    this.datas = [];
    for(let i=0; i< 30; i++) {
      this.labels.push('');
      this.datas.push(null);
    }
  }

  changeName(){
    UIActions.editName(this.props.id, this.state.name, this.setName.bind(this));
  }

  setName(newName){
    this.setState({
      name: newName
    });
  }

  render(){
    return (
      <div className="project-style">
        <span className='cloudApp-desc-title ' {...tapOrClick(this.changeName.bind(this))} >{this.state.name}</span>
        <div className='cloud-chart'>
          <canvas id='cloud-chart-canvas' ref='cloudChart'></canvas>
        </div>
    </div>);
  }

  initCanvas(){
    let ctx =this.refs.cloudChart.getContext('2d');
    this.scatterChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: [{
          data:  this.datas,
          lineTension: 0,
          pointRadius: 0,
          fill: false,
          borderWidth: 1,
          borderColor: '#FFCE27',
          pointBorderColor: '#6F809B',
          pointStyle: 'dash'
        }]
      },
      options: {
        elements: {
          line: {
            tension: 0
          }
        },
        animation: {
          easing: 'linear',
          duration: 10
        },
        legend: {
          display: false
        },
        tooltips: {
          enabled: false
        },
        scales: {
          yAxes: [{
            ticks: {
              suggestedMax: 10,
              suggestedMin: -10,
              padding: 5,
              fontColor: '#FFFFFF'
            },
            gridLines: {
              color: '#4B5668'
            },
            scaleLabel: {
              fontColor: '#6F809B'
            }
          }],
          xAxes: [{
            gridLines: {
              display: false
            },
            ticks: {
              display: false
            }
          }]
        }
      }
    });
  }

  updateCanvas(bundle) {
    if(bundle.id === this.state.id){
      this.scatterChart.data.datasets[0].data = bundle.value;
      this.scatterChart.update();
    }
  }

  MQTTConnect() {
    if(this.props.topic) {
      this.topic = this.props.topic.input;
      appStore.subscribeMQTTTopic(this.topic);
    }
  }
  MQTTMessage(message) {
    let value = JSON.parse(message);
    this.datas.push(value);
    this.datas.shift();
    this.scatterChart.data.datasets[0].data = this.datas;
    this.scatterChart.update();
  }
  componentDidMount() {
    let self = this;
    self.initCanvas();

    if(self.props.mode == 'preview-mode') {
      self.topic = self.props.topic.input;
      self.MQTTConnectFunc = self.MQTTConnect.bind(self);
      appStore.on('connect', self.MQTTConnectFunc);
      self.MQTTMessageFunc = self.MQTTMessage.bind(self);
      appStore.on('message:' + self.topic, self.MQTTMessageFunc);

    } else if(self.props.mode == 'edit-mode') {
      self.updateOutputFunc = self.updateCanvas.bind(self);
      nodeStore.on('NodeOutputChange', self.updateOutputFunc);
    }
  }
  componentWillUnmount() {
    if(this.props.mode == 'preview-mode') {
      appStore.off('connect', this.MQTTConnectFunc);
    } else if(this.props.mode == 'edit-mode') {
      nodeStore.off('NodeOutputChange', this.updateInputFunc);
    }
  }
}


export { CloudLineGraph };
