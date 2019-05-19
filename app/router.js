import React from 'react';
import { render } from 'react-dom';
import { Router, Route, hashHistory } from 'react-router';
import { App } from 'pages/App';
import { CloudApp } from 'pages/CloudApp';
import { Index } from 'pages/Index';

render((
  <Router history={hashHistory}>
    <Route path="/" component={Index}/>
    <Route path="/app/(:id)" component={App}/>
    <Route path="/app/cloud/(:id)" component={CloudApp}/>
  </Router>
), document.getElementById('app-container'));