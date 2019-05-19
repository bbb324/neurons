import React, { Component } from 'react';
import tapOrClick from '../../utils/tapOrClick';
import { Link } from 'react-router';
import projectStore from '../../stores/projectStore';
import cloudAppStore from '../../stores/cloudAppStore';
import LinkStore from '../../stores/LinkStore';
import languages from '../../languages';
import UIActions from '../../actions/UIActions';
require('./ProjectManagement.less');

/*const SCREEN_HEIGHT = window.screen.width>window.screen.height?window.innerHeight: window.innerWidth;
const PROJECT_HEADER_HEIGHT = 96;*/

class ProjectManagement extends Component {

  constructor() {
    super(...arguments);
    this.borderStyle=['#48dfa0', '#fdd242', '#ffa86b', '#bb99fb', '#50cef4'];
    this.showSelection = 'url("img/icon-canSelect.png") ';
    this.setSelection = 'url("img/icon-isSelect.png")';
    this.whiteTrashcan = 'url("img/icon-delete-white.png")';
    this.redTrashcan = 'url("img/icon-delete-red.png")';
    this.canSaveStyle = {background: '#4985ce', color: '#ebf4ff'};
    this.cannotSaveStyle = {background: '#bababa', color: '#ffffff'};
    this.cloudProjectArray = [];
    this.state = {
      isActive: 'normal',
      projects: projectStore.getAllProjectsDesc(),
      canSelect: 'close',
      action: 'edit',
      openDeletePanel: 'close',
      openResetNamePanel: 'close',
      openExternalPanel: 'close',
      deleteIcon: this.whiteTrashcan,
      resetNameProject: {
        img: '',
        name: '',
        id: '',
        borderColor: ''
      },
      projectArray: [],
      saveAble: false
    };
  }
  touchStart(e) {
    if(e.currentTarget.scrollTop == 0) {
      this.startY = e.changedTouches[0].pageY;
    }
  }
  touchMove(e) {

    this.deltaY = e.changedTouches[0].pageY - this.startY;
    if(this.deltaY>=45) return;
    document.querySelector('.projects-table').style.paddingTop = this.deltaY + 'px';
    this.refs.showVersion.style.marginTop = (-24+this.deltaY)+'px';
  }
  touchEnd() {
    document.querySelector('.projects-table').style.paddingTop = 0;
    this.refs.showVersion.style.marginTop = '';
  }

  renderProjectsList() {
    if(this.state.projects.length ==0) {
      return (<div className='project-initiate' key={'initiation'} >
        <div className='project-initiate-body' data-version={this.showAppVersion()}>
          <img src='img/icon-project-initiation.png' />
          <span className="project-initiate-txt">{languages.getTranslation('construct-dream')}</span>
          <Link to='/app/create'>
          <span className='create'>{languages.getTranslation('new-project')}</span>
          </Link>
        </div>
      </div>);
    } else {
      return ( <div className='projects-table'
                    
                    onTouchStart={this.touchStart.bind(this)}
                    onTouchMove={this.touchMove.bind(this)}
                    onTouchEnd={this.touchEnd.bind(this)}
                    ref='tab'>
        <ul className={'projects-list '} ref='list'>
          {this.projectOverview()}
        </ul>
      </div>);
    }
  }


  // show each project
  projectOverview() {
    let projSet = this.distinguish(this.state.projects);
    let overview, link;

    if(this.state.isActive == 'cloud') {
      overview = [];
      link = '/app/cloud/';
    } else {
      overview = [<li key={'insertNew'} className='project-overview add-new-project'>
        <Link to='/app/create'>
          <span className='create'>{languages.getTranslation('new-project')}</span>
          <img className='project-thumbnail' src={'img/icon-add.png'}/>
        </Link>
      </li>];
      link = '/app/';
    }

    projSet = this.sortProject(projSet);
    for (let project=projSet.length-1; project>=0; project--) {
      overview.push(<li className='project-overview' key={projSet[project].projectId} data-id={projSet[project].projectId} style={{borderColor: this.getBorder(projSet[project].desc['index'])}}>
        <span className={'select-project '+(this.state.canSelect=='close'?'hide':'')}
              style={{backgroundImage: this.isSelect(projSet[project].projectId)}} {...tapOrClick(this.selected.bind(this))}></span>
        <Link to={link + projSet[project].projectId}>
          <img className='project-thumbnail' src={projSet[project].desc['thumbnail']} />
      </Link>
        <span className='project-name' data-name={projSet[project].desc['name']==''?'untitled':'named'} {...tapOrClick(this.openResetNamePanel.bind(this))} >{projSet[project].desc['name']==''?languages.getTranslation('untitled'): projSet[project].desc['name']}</span>
      </li>);
    }
    return overview;
  }

  // if in cloud app mode, get all cloud app
  distinguish(projects) {
    let list = projects;
    if(this.state.isActive == 'cloud') {
      list = [];
      projects.forEach((project)=>{
        if(project.desc.cloudempty == 1) {
          list.push(project);
        }
      });
    }
    return list;
  }

  // sort project list by index in decrease
  sortProject(projSet){
    projSet.sort((a,b)=>{
      return a.desc.index-b.desc.index;
    });
    return projSet;
  }

  isSelect(id){
    if(this.state.projectArray.indexOf(id)!=-1){
      return this.setSelection;
    }
    return this.showSelection;
  }

  // return border color for each project
  getBorder(index){
    let v = index%5;
    return this.borderStyle[v];
  }

  // reset project name
  openResetNamePanel(e){
    let curProject = e.target.closest('.project-overview');
    this.setState({
      openResetNamePanel: 'open',
      openExternalPanel: 'open',
      resetNameProject: {
        id: curProject.dataset.id,
        name: e.target.textContent,
        img: curProject.querySelector('.project-thumbnail').src,
        borderColor: curProject.style.borderColor
      },
      saveAble: e.target.dataset.name == 'untitled'?false:true
    });
    this.refs.inputBox.value = e.target.dataset.name == 'untitled'?'':e.target.textContent;
  }

  //show reset name panel
  resetName(){
    return (
      <div className={'reset-name '+(this.state.openResetNamePanel=='close'?'hide':'')} ref='inputDialog'>
        <img className='project-image' src={this.state.resetNameProject.img} style={{border: '6px solid ' + this.state.resetNameProject.borderColor}}></img>
        <div className='reset-name-div'>
          <span className='reset-name-title'>{languages.getTranslation('please-name-your-node')}</span>
          <input ref='inputBox' className='reset-name-text' type='text' placeholder={languages.getTranslation('untitled')}/>
          <span className='reset-name-button' style={this.state.saveAble==true?this.canSaveStyle:this.cannotSaveStyle} {...tapOrClick(this.saveName.bind(this))} ref='resetNameSave'>{languages.getTranslation('save')}</span>
        </div>
      </div>
    );
  }

  //save new Name
  saveName(e){
    let newName = e.target.closest('.reset-name-div').querySelector('.reset-name-text').value;
    if(newName.length != 0) {
      projectStore.saveProjectName(this.state.resetNameProject.id, newName);
      this.setState({
        openResetNamePanel: 'close',
        openExternalPanel: 'close',
        resetNameProject: {
          id: '',
          name: '',
          img: '',
          borderColor: ''
        },
        projects: projectStore.getAllProjectsDesc(),
        saveAble: false
      });
      this.refs.inputBox.blur();
      this.refs.inputBox.value = '';
    }
  }
  // choose project to delete
  selected(e){
    e.preventDefault();
    let tmpArray, targetId = e.target.closest('.project-overview').dataset.id;
    tmpArray = this.state.projectArray;


    projectStore.getAllProjectsDesc().forEach((project)=>{
      if(project.projectId == targetId && project.desc.cloudID != undefined){
        this.cloudProjectArray.push(project.desc.cloudID[0]);
      }
    });
    if(tmpArray.indexOf(targetId)==-1){
      tmpArray.push(targetId);
    } else {
      tmpArray.splice(tmpArray.indexOf(targetId), 1);
    }
    this.setState({
      projectArray: tmpArray,
      deleteIcon: this.state.projectArray.length>0? this.redTrashcan: this.whiteTrashcan
    });
  }

  // switch tab between cloud and my project
  switchTab(e){
    if(e.target.dataset.type != this.state.isActive){
      this.setState({
        isActive: e.target.dataset.type,
      });
    }

    this.setState({
      projects: projectStore.getAllProjectsDesc(),
      openDeletePanel: 'close',
      action: 'edit',
      canSelect: 'close',
      openExternalPanel: 'close',
      deleteIcon: this.whiteTrashcan,
      projectArray: []
    });
    let selectOption = document.querySelectorAll('.select-project');
    for(let i=0; i<selectOption.length; i++){
      selectOption[i].style.background = 'url("img/icon-canSelect.png") 98% 2% / 40px no-repeat';
    }
    this.refs.trashCan.classList.remove('appear-from-bottom');
  }

  // choose edit or cancel
  editProject(){
    if(this.state.action == 'edit'){
      this.setState({
        action: 'cancel',
        canSelect: 'open',
      });
      this.refs.trashCan.classList.add('appear-from-bottom');
    } else {
      this.setState({
        action: 'edit',
        canSelect: 'close',
        deleteIcon: this.whiteTrashcan,
        projectArray: []
      });
      this.refs.trashCan.classList.remove('appear-from-bottom');
    }
  }

  //open delete panel
  deleteProject(){
    if(this.state.projectArray.length != 0)
    {
      this.setState({
        openDeletePanel: 'open',
        openExternalPanel: 'open'
      });
    }
  }

  cancel(){
    this.setState({
      openDeletePanel: 'close',
      action: 'edit',
      canSelect: 'close',
      openExternalPanel: 'close',
      deleteIcon: this.whiteTrashcan,
      projectArray: []
    });
    let selectOption = document.querySelectorAll('.select-project');
    for(let i=0; i<selectOption.length; i++){
      selectOption[i].style.background = 'url("img/icon-canSelect.png") 98% 2% / 40px no-repeat';
    }
    this.refs.trashCan.classList.remove('appear-from-bottom');
  }

  confirm(){
    projectStore.deleteProjectArr(this.state.projectArray);
    this.setState({
      openDeletePanel: 'close',
      action: 'edit',
      canSelect: 'close',
      openExternalPanel: 'close',
      deleteIcon: this.whiteTrashcan,
      projects: projectStore.getAllProjectsDesc(),
      projectArray: []
    });
    this.refs.trashCan.classList.remove('appear-from-bottom');
    if(this.cloudProjectArray.length!=0) {
      cloudAppStore.deleteProjects(this.cloudProjectArray);
    }
  }

  //confirm window to delete projects
  confirmDeletion(){
    let self = this;
    return (
      <div className={'delete-panel '+(this.state.openDeletePanel=='open'?'':'hide')}>
        <img className='delete-icon' src='img/icon-red-trash.png' />
        <span className='title'>{languages.getTranslation('delete-project')}</span>
        <span className='text'>{languages.getTranslation('delete-reconfirm')}</span>
        <div className={'delete-button-set '+this.state.openDeletePanel}>
          <div className="cancel" {...tapOrClick(self.cancel.bind(self))} >{languages.getTranslation('cancel')}</div>
          <div className="confirm" {...tapOrClick(self.confirm.bind(self))} >{languages.getTranslation('icon-confirm-ok')}</div>
        </div>
      </div>
    );
  }


  closeExternalPanel(){
    this.setState({
      openDeletePanel: 'close',
      action: 'edit',
      canSelect: 'close',
      openExternalPanel: 'close',
      openResetNamePanel: 'close',
      resetNameProject: {
        id: '',
        name: '',
        img: '',
        borderColor: ''
      },
      projects: projectStore.getAllProjectsDesc(),
      saveAble: false,
      projectArray: [],
      deleteIcon: this.whiteTrashcan,
    });
    this.refs.inputBox.value = null;
    this.refs.inputBox.blur();
    this.refs.trashCan.classList.remove('appear-from-bottom');
  }

  showAppVersion() {
    let version = languages.getTranslation('version-number');
    if(window._runtime == 'cordova') {
      version = version + AppVersion.version;
    } else if(window._runtime == 'electron') {
      version = version + electron.remote.app.getVersion();
    }
    return version;
  }

  render() {
    let self = this;
    return (
      <div className='project-tab' >
        <div className='project-item' ref='title'>
          <div className={'project-category '+ (this.state.isActive=='normal'?'active':'')} {...tapOrClick(self.switchTab.bind(self))} data-type='normal'>{languages.getTranslation('my-project-list')}</div>
          <div className={'project-category hide '+(this.state.isActive=='cloud'?'active':'')} {...tapOrClick(self.switchTab.bind(self))} data-type='cloud'>{languages.getTranslation('cloud-app-list')}</div>
          <div className={'project-category edit '+ (this.state.isActive == 'cloud'? 'hide':'')} data-type={this.state.action} {...tapOrClick(self.editProject.bind(self))}>{this.state.action=='edit'?languages.getTranslation('edit-link'):languages.getTranslation('cancel')}</div>
        </div>
        <span className="showVersion" ref='showVersion'>{this.showAppVersion()}</span>
        {this.renderProjectsList()}
        <div className='delete-project' ref='trashCan'><div className='delete-project-icon' {...tapOrClick(self.deleteProject.bind(self))} style={{backgroundImage: this.state.deleteIcon}}></div></div>
        <div className={'panel-cover '+(this.state.openExternalPanel=='open'?'':'hide')} {...tapOrClick(self.closeExternalPanel.bind(self))}></div>
        {this.confirmDeletion()}
        {this.resetName()}

      </div>
    );
  }

  quit() {
    if (LinkStore.getStatus() == 'connected') {
      UIActions.disconnectLinkDevice(false);
    }
    navigator.app.exitApp();
  }

  componentDidMount(){
    let self = this;
    this.loadProjectFunc = this.loadProject.bind(this);
    this.quitFunc = this.quit.bind(this);
    projectStore.on('saveFinished', this.loadProjectFunc);
    document.addEventListener('backbutton', this.quitFunc, false);
    this.refs.inputBox.addEventListener('input', ()=>{
      if(self.refs.inputBox.value.length !=0){
        self.setState({
          saveAble: true
        });
      } else {
        self.setState({
          saveAble: false
        });
      }
    });
    if(window._runtime == 'cordova' && /Android/.test(navigator.appVersion)) {
      window.addEventListener('native.keyboardshow', ()=> {
        if (window.scrollY < 100 && self.refs.inputDialog) //键盘高度一般大于100，如果scrollY小于100，可以认为界面未上移，则需要手动上移
        {
          self.refs.inputDialog.style.top = self.refs.inputDialog.clientHeight+'px';
        }
      });
      window.addEventListener('native.keyboardhide', ()=>{
        if (self.refs.inputDialog != undefined) {
          self.refs.inputDialog.style.top = '';
        }
      });
    }

  }

  componentWillMount(){
    if(localStorage.getItem('state')!=null)
    {
      this.setState({
        isActive: localStorage.getItem('state')
      });
      localStorage.setItem('state', 'normal');
    }
  }
  
  loadProject(){
    this.setState({
      projects: projectStore.getAllProjectsDesc()
    });
  }

  shouldComponentUpdate(nProps, nState) {
    if(nState !== this.state) {
      return true;
    }
    return false;
  }

  componentWillUnmount(){
    localStorage.setItem('state', this.state.isActive);
    projectStore.off('saveFinished', this.loadProjectFunc);
    if(window._runtime == 'cordova' && /Android/.test(navigator.appVersion)) {
      window.removeEventListener('native.keyboardshow');
      window.removeEventListener('native.keyboardhide');
      document.removeEventListener('backbutton', this.quitFunc, false);
    }
  }

}

export { ProjectManagement };