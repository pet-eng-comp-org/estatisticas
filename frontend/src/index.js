import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.css'

import Grade from './pages/Grade';

ReactDOM.render(
    <BrowserRouter>
        <Switch>
            <Route path="/" exact={true} render={() => <Grade modo="periodo" />} />
            <Route path="/departamentos" render={() => <Grade modo="departamento" />} />
            <Route path="/nome" render={() => <Grade modo="nome" />} />
        </Switch>
    </BrowserRouter>
    , document.getElementById('root')
);
