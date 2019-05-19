/**
 * Created by junxie on 2017/2/4.
 */
import React, { Component }  from 'react';
import { CloudAppManagement } from '../components/projectManagement/CloudAppManagement.react';

require('main.less');

class CloudApp extends Component {

  render() {
    return (
      <CloudAppManagement id={this.props.params.id}/>
    );
  }
}

export { CloudApp };


