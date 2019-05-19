/**
 * Created by junxie on 2017/2/27.
 */
import React, { Component } from 'react';
import { Link } from 'react-router';
import projectStore from '../../stores/projectStore';
import languages from '../../languages';
import { CloudSlider } from '../cloudComponent/CloudSlider.react';
import { CloudButton } from '../cloudComponent/CloudButton.react';
import { CloudToggle } from '../cloudComponent/CloudToggle.react';
import { CloudLabel } from '../cloudComponent/CloudLabel.react';
import { CloudPhotoFrameViewer } from '../cloudComponent/CloudPhotoFrameViewer.react';
import { CloudText } from '../cloudComponent/CloudText.react';
import { CloudNumber } from '../cloudComponent/CloudNumber.react';
import { CloudIndicator } from '../cloudComponent/CloudIndicator.react';
import { CloudLineGraph } from '../cloudComponent/CloudLineGraph.react';
import nodeStore from '../../stores/nodeStore';
import appStore from '../../stores/AppStore';
require('./CloudAppManagement.less');

class CloudAppManagement extends Component {
  constructor(){
    super(...arguments);
    this.state = {
      nodes: [],
      preview: appStore.isPreview()
    };
  }

  getCloudApp(type, id, topic) {
    let nameValue = nodeStore.getCurrentConfig(id, 'name') || languages.getTranslation('untitled');
    let action;
    switch (type) {
    case 'CONTROLBUTTON': //按钮
      return <CloudButton name={nameValue} id={id} topic={topic} mode={'preview-mode'}/>;
    case 'SLIDER': //滑块
      action = nodeStore.getCurrentConfig(id, 'state');
      return <CloudSlider name={nameValue} id={id} action={action} topic={topic} mode={'preview-mode'}/>;
    case 'CONTROLTOGGLE': //开关
      action = nodeStore.getCurrentConfig(id, 'state');
      return <CloudToggle name={nameValue} id={id} action={action} topic={topic} mode={'preview-mode'}/>;
    case 'LABEL': // 标签
      action = nodeStore.getNodeInputValue(id, 'text');
      return <CloudLabel name={nameValue} id={id} action={action} topic={topic} mode={'preview-mode'}/>;
    case 'PHOTO_FRAME': // 图片查看器
      action = nodeStore.getNodeInputValue(id, 'snapshot') || '';
      return <CloudPhotoFrameViewer id={id} src={action.file} mode={'edit-mode'}/>;
    case 'TEXT_INPUT': //文本输入
      action = nodeStore.getCurrentConfig(id, 'text');
      return <CloudText name={nameValue} id={id} action={action} topic={topic} mode={'preview-mode'}/>;
    case 'NUMBER_INPUT': //数字输入
      action = nodeStore.getCurrentConfig(id, 'number');
      return <CloudNumber name={nameValue} id={id} action={action} topic={topic} mode={'preview-mode'}/>;
    case 'INDICATOR': //指示灯
      action = nodeStore.getNodeInputValue(id, 'input');
      return <CloudIndicator name={nameValue} id={id} action={action} topic={topic} mode={'preview-mode'}/>;
    case 'LINE_GRAPH': //图表显示
      return <CloudLineGraph name={nameValue} id={id} topic={topic} mode={'preview-mode'}/>;
    default:
      console.log('nothing');
    }
  }

  renderCloudApp(){
    let list = projectStore.openCloudProject(this.props.id);
    let nodes = list.cloud.map((node)=>{
      return (
        <li className='cloud-app-detail' key={node.id} data-id={node.id}>
          {this.getCloudApp(node.type, node.id, node.topics)}
        </li>
      );
    });
    return nodes;
  }

  render(){
    return (
      <div>
        <div className='title-cloud'>
          <Link to="/" className='back'><i className='icon-backward' style={{background: 'url("img/icon-backward.png") center / 40px no-repeat'}} /></Link>
          <span className='title-txt'>{languages.getTranslation('cloud-title')}</span>
          <Link to="/" className='login-entrance' style={{display: 'none'}}>登录后发布</Link>
        </div>
        <div className='cloud-app-table'>
          <ul className='cloud-app-list'>
          {this.renderCloudApp()}
        </ul>
        </div>
      </div>
    );
  }



  componentDidMount(){
    appStore.onProjectLoaded();
  }
}

export { CloudAppManagement };