import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Switch, Route} from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.css'

import Departamentos from './pages/Departamentos'
import Nome from "./pages/Nome"
import App from './pages/App';
ReactDOM.render(
    <BrowserRouter>
                <Switch>
                    <Route path="/" exact={true} component={App}/>
                    <Route path="/departamentos" component={Departamentos}/>
                    <Route path="/nome" component={Nome}/>
                </Switch>
            </BrowserRouter>
    , document.getElementById('root')
);
