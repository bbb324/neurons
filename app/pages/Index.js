/**
 * Created by junxie on 2017/1/23.
 */
import React, { Component } from 'react';
import { ProjectManagement } from '../components/projectManagement/ProjectManagement.react.js';
import projectStore from '../stores/projectStore';

class Index extends Component {
  constructor() {
    super(...arguments);
    console.log(this.props);
  }

  render() {
    return (
      <div>
        <ProjectManagement/>
      </div>
    );
  }

  componentDidMount(){
    this.props.router.setRouteLeaveHook(this.props.route, this.routerWillLeave);
  }

  routerWillLeave() {
    // return false to prevent a transition w/o prompting the user,
    // or return a string to allow the user to decide:
    // return `null` or nothing to let other hooks to be executed
    //
    // NOTE: if you return true, other hooks will not be executed!
    if (!projectStore.getSaveProject())
      return 'Your project is not saved! Are you sure you want to leave?';
  }
}

export { Index };

