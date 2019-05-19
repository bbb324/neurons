/**
 * Created by junxie on 2016/12/12.
 */

import React, { PureComponent } from 'react';
import {Inputs, Outputs, Tools} from '../../Node.react';
import languages from '../../../../languages';
import nodeStore from '../../../../stores/nodeStore';
import tapOrClick from 'react-tap-or-click';
import UIActions from '../../../../actions/UIActions';
import Chart from 'chart.js';
require('./ControlLineGraph.less');

class ControlLineGraph extends PureComponent {

  constructor() {
    super(...arguments);
    this.state = {
      data: this.props.action
    };
    this.counter = 1;
    this.data = [];

  }

  initCanvas(){
    let ctx =this.refs.cloudChart.getContext('2d');

    let labels = [];
    let defaultData = [];
    for(let i=0; i< 30; i++) {
      labels.push('');
      defaultData.push(null);
    }
    this.scatterChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          data: defaultData,
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
              suggestedMax: 1,
              suggestedMin: -1,
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

  renderPreview() {
    return (
      <div className={'node-preview node-preview-palette node-type-' + this.props.info.name} id={this.props.nodeId} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <img className="node-preview-icon" src="img/icon-line-graph.png" />
        <span className="node-preview-name">{languages.getTranslation('control-line-graph')}</span>
      </div>
    );
  }

  EditName(){
    UIActions.editName(this.props.id, nodeStore.getCurrentConfig(this.props.id, 'name'));
  }

  renderActual() {
    return (
      <div className={'node-actual node-type-' + this.props.info.name} id={this.props.id} style={{
        left: this.props.left + 'px',
        top: this.props.top + 'px'
      }} data-type={this.props.info.name} data-category={this.props.info.props.category}>
        <div className='node-body node-draggable hide-config' >
          <span className='editer-gear' {...tapOrClick(this.EditName.bind(this))} style={{background:'url("img/icon-gear.png") center center / 20px no-repeat'}}></span>
          <div className="node-actual-content">
            <canvas id='cloud-chart-canvas' ref="cloudChart"></canvas>
          </div>
        </div>
        <Inputs ports={this.props.info.props.in} nodeId={this.props.id} />
        <Outputs ports={this.props.info.props.out} nodeId={this.props.id} />
        <Tools nodeId={this.props.id} category={this.props.info.props.category}/>
      </div>
    );
  }

  render() {
    return this.props.isPreview ? this.renderPreview() : this.renderActual();
  }

  updateCanvas(bundle) {
    if(bundle.id === this.props.id){
      this.scatterChart.data.datasets[0].data = bundle.value;
      this.scatterChart.update();
    }
  }

  componentDidMount() {
    if( !this.props.isPreview ) {
      this.initCanvas();
      this.updateOutputFunc = this.updateCanvas.bind(this);
      nodeStore.on('NodeOutputChange', this.updateOutputFunc);

      UIActions.initConfig(this.props.id);
    }
  }

  componentWillUnmount() {
    if( !this.props.isPreview ) {
      nodeStore.off('NodeOutputChange', this.updateOutputFunc);
    }
  }

}

export { ControlLineGraph };
