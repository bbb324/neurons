/**
 * Created by junxie on 2017/3/7.
 */
import EventEmitter from 'wolfy87-eventemitter';
import RestfulApiImpl from '../utils/RestfulApiImpl';
import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants from '../constants/AppConstants';
import engine, {engineGetUUID} from '../core/FlowEngine';
import ProjectStore from './projectStore';
class cloudAppStore extends EventEmitter {
  constructor() {
    super(...arguments);
    this.projectURL = '';
    let self = this;
    AppDispatcher.register((action)=>{
      if (action.actionType == AppConstants.SHARE_CLOUD_PROJECT) {
        let jsonData = JSON.stringify(engine.getActiveCloudNodes());
        let postData = {device_id: engineGetUUID(), local_id: ProjectStore.getCurrentProjectId(), project_name: ProjectStore.getCurrentProjectName(), project_data: jsonData};
        self.postCloudAppData(postData, ProjectStore.getCloudSharedId());
      } else if(action.actionType == AppConstants.UPDATE_CLOUD_PROJECT) {
        self.updateCloudProject();
      }
    });
  }

  updateCloudProject() {
    if(ProjectStore.getCloudSharedId() != '') {
      let jsonData = JSON.stringify(engine.getActiveCloudNodes());
      let postData = {device_id: engineGetUUID(), local_id: ProjectStore.getCurrentProjectId(), project_name: ProjectStore.getCurrentProjectName(), project_data: jsonData};
      this.postCloudAppData(postData, ProjectStore.getCloudSharedId());
    }
  }

  fetchSuccess(id) {
    if(id == 'defaultCloudID') {
      return;
    }
    this.projectURL = 'http://iot.makeblock.com/http/cloudapp/?id='+id;
    ProjectStore.setCloudSharedId(id);
    this.trigger('fetchSuccess', [{status: 'success', url: this.projectURL, id: id}]);
  }

  fetchError() {
    this.trigger('fetchFail', [{status: 'fail', url: ''}]);
  }

  revokeSuccess() {
    this.projectURL = '';
    ProjectStore.clearCloudSharedId();
    this.trigger('revokeSuccess');
  }
  revokeFailed() {
    this.trigger('revokeFail');
  }

  postCloudAppData(data, cloudId) {
    let setUrl;
    if(cloudId == undefined || cloudId == '') {
      setUrl = 'http://iot.makeblock.com/http/cloudapps';
    } else {
      setUrl = 'http://iot.makeblock.com/http/cloudapps/'+cloudId;
    }
    let self = this;
    let callback = function(status, responseText) {
      if(responseText == 'timeout' || status == 0) {
        self.fetchError();
      }
      if(status == 200) {
        let result = JSON.parse(responseText);
        if(result.errCode == 0) {
          self.fetchSuccess(result.cloudID);
        } else {
          self.fetchError();
        }
      } else {
        self.fetchError();
      }
    };
    RestfulApiImpl.doPost(setUrl, JSON.stringify(data), callback, 5000);
  }

  revokeCloudAppData(cloudId) {
    let setUrl = 'http://iot.makeblock.com/http/cloudapps/'+cloudId;
    let self = this;
    let callback = function(status, responseText) {
      if(responseText == 'timeout' || status == 0) {
        self.revokeFailed();
      }
      if(status == 200) {
        let result = JSON.parse(responseText);
        if(result.errCode == 0) {
          self.revokeSuccess();
        } else {
          self.revokeFailed();
        }

      } else {
        self.revokeFailed();
      }
    };
    RestfulApiImpl.doDelete(setUrl, callback, 5000);
  }

  deleteProjects(cloudList) {
    let setUrl = 'http://iot.makeblock.com/http/cloudapps/delete';
    let postData = {device_id: engineGetUUID(), localIDs: cloudList};
    let callback = function(status) {
      if(status == 200) {
        //remote delete published cloud apps do not respond
        console.log('remote delete success!!');
      } else {
        console.log('remote delete fail');
      }
    };
    RestfulApiImpl.doPost(setUrl, JSON.stringify(postData), callback, 5000);
  }
}

export default new cloudAppStore();