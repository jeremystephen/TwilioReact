import React, { Component } from "react";
import AppBar from 'material-ui/AppBar';
import { render } from "react-dom";
import "./styles/styles.css";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import * as Colors from 'material-ui/styles/colors'
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
/*import injectTapEventPlugin from "react-tap-event-plugin";*/
/*injectTapEventPlugin();*/


let dom = document.getElementById("app");
render(
    <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme.palette.canvasColor='#fffde7')}>
            <div>
            <AppBar color="primary" title="Celery Video" />
            </div>
    </MuiThemeProvider>
    ,
    dom
);