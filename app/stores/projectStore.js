import EventEmitter from 'wolfy87-eventemitter';
import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants from '../constants/AppConstants';
import engine, {restartEngine} from '../core/FlowEngine';
// import languages from '../languages';

let _instance = null;

const PROJECT_INDEX = 'index';
const PROJECT_NAME = 'name';
const PROJECT_THUMBNAIL = 'thumbnail';
const PROJECT_KEY = 'projectkey';
const CLOUD_KEY = 'cloudkey';
const CLOUD_EMPTY = 'cloudempty';
const LAST_PROJECTID = 'lastid';
const PROJECTID_PREFIX = 'projectid@@';
const PROJECTKEY_PREFIX = 'projectkey##';
const CLOUDKEY_PREFIX = 'cloudkey##';

const EVENT_PROJECT_CHANGED = 'projectChange';
const EVENT_CLOUD_PROJECT_CHANGED = 'cloudProjectChange';

const EVENT_SAVE_FINISHED = 'saveFinished';

class ProjectStore extends EventEmitter {
  constructor() {
    super();
    this._localStorage = localStorage;
    this._currentProjectId = '@@##';
    this._currentProjectDesc = {'index': 0, 'name': '', 'thumbnail': '', 'projectkey': '', 'cloudkey': '', 'cloudempty': 0};
    this._currentProjectData = {'editer':{'wires':[], 'nodes':[]}, 'engine':[]};
    this._currentCloudData = {'cloud': '', 'sharedId': ''};
    /*this._timer = setInterval(() => {
      this.saveScreenshot();
    },1000);*/
    this.isSaveProject = true;
  }


  resetCurrentProject() {
    this._currentProjectId = '@@##';
    this._currentProjectDesc = {'index': 0, 'name': '', 'thumbnail': '', 'projectkey': '', 'cloudkey': '','cloudempty': 0};
    this._currentProjectData = {'editer':{'wires':[], 'nodes':[]}, 'engine':[]};
    this._currentCloudData = {'cloud': '', 'sharedId': ''};
  }

  getCurrentProjectId() {
    return this._currentProjectId;
  }

  getCurrentProjectName() {
    return this._currentProjectDesc[PROJECT_NAME];
  }


  getCurrentProjectData() {
    return this._currentProjectData;
  }

  getCurrentCloudData() {
    return this._currentCloudData;
  }

  getCurrentCloudId() {
    return this._currentProjectDesc.cloudID;
  }

  genProjectId() {
    // get the last number
    let lastIdNumber = 0;
    let lastId = this._localStorage.getItem(LAST_PROJECTID);
    if (lastId == null) {
      let maxNumber = 0;
      for (let i = 0; i < this._localStorage.length; i++) {
        let key = this._localStorage.key(i);
        let index = key.indexOf(PROJECTID_PREFIX);
        if (index == 0) {
          let idNumber = key.substring(PROJECTID_PREFIX.length, index.length);
          let number = Number(idNumber);
          if (number > maxNumber) {
            maxNumber = number;
          }
        }
      }
      lastIdNumber = maxNumber + 1;
    } else {
      lastIdNumber = Number(lastId) + 1;
    }

    // set the lastid back to the localStorage
    let lastIdString = String(lastIdNumber);
    let proId = lastIdString;
    this._localStorage.setItem(LAST_PROJECTID, proId);
    console.log('proId:' + proId);
    return proId;
  }

  createProject() {
    this.resetCurrentProject();

    let proId = this.genProjectId();
    let projectId = PROJECTID_PREFIX + proId + '_' + new Date().getTime();
    let projectKey = PROJECTKEY_PREFIX + proId;
    let cloudKey = CLOUDKEY_PREFIX + proId;

    this._currentProjectId = projectId;
    this._currentProjectDesc[PROJECT_INDEX] = Number(proId);
    this._currentProjectDesc[PROJECT_KEY] = projectKey;
    this._currentProjectDesc[CLOUD_KEY] = cloudKey;
    this._currentProjectDesc[PROJECT_NAME] = '';
    this._localStorage.setItem(projectKey, JSON.stringify(this._currentProjectData));
    this._localStorage.setItem(cloudKey, JSON.stringify(this._currentCloudData));
    this._localStorage.setItem(this._currentProjectId, JSON.stringify(this._currentProjectDesc));

    restartEngine();
    
    this.trigger(EVENT_PROJECT_CHANGED);
  }

  openProject(projectId) {
    this.resetCurrentProject();
    console.log('open project. projectId:' + projectId);

    this._currentProjectId = projectId;
    this._currentProjectDesc = JSON.parse(this._localStorage.getItem(this._currentProjectId));
    if(this._currentProjectDesc == null) {
      return;
    }
    let projectKey = this._currentProjectDesc[PROJECT_KEY];
    let cloudKey = this._currentProjectDesc[CLOUD_KEY];
    this._currentProjectData = JSON.parse(this._localStorage.getItem(projectKey));
    this._currentCloudData = JSON.parse(this._localStorage.getItem(cloudKey));

    engine.loadFlow(this._currentProjectData.engine);

    this.trigger(EVENT_PROJECT_CHANGED); 
  }

  openCloudProject(projectId) {
    this.resetCurrentProject();
    console.log('open cloud project. projectId:' + projectId);

    this._currentProjectId = projectId;
    this._currentProjectDesc = JSON.parse(this._localStorage.getItem(this._currentProjectId));
    if(this._currentProjectDesc == null) {
      return;
    }
    let cloudKey = this._currentProjectDesc[CLOUD_KEY];
    this._currentCloudData = JSON.parse(this._localStorage.getItem(cloudKey));

    this.trigger(EVENT_CLOUD_PROJECT_CHANGED);
    return this._currentCloudData;
  }

  deleteProject(projectId) {
    console.log('delete project. projectId:' + projectId);
    let projectDesc = JSON.parse(this._localStorage.getItem(projectId));
    if(projectDesc == null) {
      return;
    }
    let projectKey = projectDesc[PROJECT_KEY];
    let cloudKey = projectDesc[CLOUD_KEY];
    this._localStorage.removeItem(projectKey);
    this._localStorage.removeItem(cloudKey);
    this._localStorage.removeItem(projectId);
  }

  deleteProjectArr(projectIdArr) {
    for(let i = 0; i < projectIdArr.length; i++) {
      let projectId = projectIdArr[i];
      this.deleteProject(projectId);
    }
  }

  saveProject(projectId, projectData, cloudData, thumbImg) {
    console.log('save');
    console.log('projectId:', projectId);
    if(projectId == null || projectId == undefined) {
      this.createProject();
    } else if(this._currentProjectId != projectId) {
      console.log('unexpected case: this._currentProjectId:' + this._currentProjectId + ', projectId:' + projectId);
      return;
    }
    
    console.log('saving project.. projectData:' + projectData);
    let engineData = engine.exportFlow();
    let editerData = projectData;
    this._currentProjectData.engine = engineData;

    if(projectData != null && projectData != undefined) {
      this._currentProjectData.editer = editerData;
    }

    if(cloudData != null && cloudData != undefined) {
      this._currentCloudData.cloud = cloudData;
      console.log('cloudData:', this._currentCloudData);
      this._currentProjectDesc[CLOUD_EMPTY] = 1;
    } else {
      this._currentProjectDesc[CLOUD_EMPTY] = 0;
    }
    this._currentProjectDesc[PROJECT_THUMBNAIL] = thumbImg;
    let projectKey = this._currentProjectDesc[PROJECT_KEY];
    let cloudKey = this._currentProjectDesc[CLOUD_KEY];
    this._localStorage.setItem(projectKey, JSON.stringify(this._currentProjectData));
    this._localStorage.setItem(cloudKey, JSON.stringify(this._currentCloudData));
    this._localStorage.setItem(this._currentProjectId, JSON.stringify(this._currentProjectDesc));
    
    this.trigger(EVENT_SAVE_FINISHED);

    this.setSaveProject(true);
  }

  saveProjectName(projectId, projectName) {

    let desc = JSON.parse(this._localStorage.getItem(projectId));
    if(desc == null) {
      return;
    }
    desc[PROJECT_NAME] = projectName;
    this._localStorage.setItem(projectId, JSON.stringify(desc));
  }

  getAllProjectsDesc() {
    let descArr = [];
    for (let i = 0; i < this._localStorage.length; i++) {
      let projectId = this._localStorage.key(i);
      let index = projectId.indexOf(PROJECTID_PREFIX);
      if (index == 0) {
        descArr.push({
          projectId: projectId,
          desc: JSON.parse(this._localStorage.getItem(projectId))
        });
      }
    }
    return descArr;
  }

  getCloudSharedId() {
    console.log('getCloudsharedId sharedId:', this._currentCloudData.sharedId);
    return this._currentCloudData.sharedId;
  }

  clearCloudSharedId() {
    console.log('clearCloudsharedId sharedId:', this._currentCloudData.sharedId);
    this._currentCloudData.sharedId = '';
  }

  setCloudSharedId(sharedId) {
    console.log('setCloudsharedId sharedId:', sharedId);
    this._currentCloudData.sharedId = sharedId;
  }

  getSaveProject() {
    return this.isSaveProject;
  }

  setSaveProject(boolean) {
    this.isSaveProject = boolean;
  }
  // getAllCloudProjectsDesc() {
  //   let cloudArr = [];
  //   for (let i = 0; i < this._localStorage.length; i++) {
  //     let projectId = this._localStorage.key(i);
  //     let index = projectId.indexOf(PROJECTID_PREFIX);
  //     if (index == 0) {
  //       let desc = JSON.parse(this._localStorage.getItem(projectId)); 
  //       let cloudKey = desc[CLOUD_KEY];
  //       cloudArr.push({
  //         projectId: projectId,
  //         cloud: JSON.parse(this._localStorage.getItem(cloudKey))
  //       });
  //     }
  //   }
  //   return cloudArr;
  // }

}

_instance = new ProjectStore();

AppDispatcher.register((action) => {
  if(action.actionType == AppConstants.PROJECT_CREATE) {
    console.log('ProjectStore: PROJECT_CREATE');
    _instance.createProject();
  } else if (action.actionType == AppConstants.PROJECT_SAVE) {
    console.log('ProjectStore: PROJECT_SAVE');

    _instance.saveProject(action.projectId, action.projectData, action.cloudData, action.thumbImg);
  } else if(action.actionType == AppConstants.PROJECT_OPEN) {
    console.log('ProjectStore: PROJECT_OPEN');
    setTimeout(()=>{ 
      // just make sure that other callbacks are invoked before this.
      _instance.openProject(action.projectId);
    }, 1);
  } else if(action.actionType == AppConstants.PROJECT_CLOUD_OPEN) {
    console.log('ProjectStore: PROJECT_CLOUD_OPEN');
    setTimeout(()=>{ 
      // just make sure that other callbacks are invoked before this.
      _instance.openCloudProject(action.projectId);
    }, 1);
  } else if(action.actionType == AppConstants.PROJECT_DELETE) {
    console.log('ProjectStore: PROJECT_DELETE');
    _instance.deleteProjectArr(action.projectIdArr);
  } else if(action.actionType == AppConstants.PROJECT_SAVE_NAME) {
    console.log('ProjectStore: PROJECT_SAVE_NAME');
    _instance.saveProjectName(action.projectId, action.projectName);
  }

});


export default _instance;