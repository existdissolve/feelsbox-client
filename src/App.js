import React, { Component } from 'react';
import ReactDOM from "react-dom";
import {HashRouter, Route} from 'react-router-dom';
import * as firebase from 'firebase';

import config from '-/config';
import Main from '-/components/emoji/Main';
import CanvasGrid from '-/components/canvas/Grid';
import Upload from '-/components/Upload';
import AppBar from '-/components/AppBar';
import CssBaseline from 'material-ui/CssBaseline';

var app = firebase.initializeApp(config);
window.oncontextmenu = function() { return false; }

function onSignIn (user) {

}

class App extends Component {
    constructor (props) {
        super(props);

        this.state = {
            loggedIn: false
        };
    }

    componentWillMount () {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                // user is signed in
                this.setState({
                    loggedIn: true
                });
            } else {
                var provider = new firebase.auth.GoogleAuthProvider();
                firebase.auth().signInWithRedirect(provider);
            }
        });
    }

    render () {
        const {loggedIn} = this.state;

        if (!loggedIn) {
            return (
                <div className="App">
                    <AppBar title="Login" />
                    <div className="g-signin2" data-onsuccess="onSignIn" data-theme="dark"></div>
                    <p className="App-intro">
                        Please login!
                    </p>
                </div>
            );
        }

        return (
            <div className="App">
                <CssBaseline />
                <Route exact path="/" component={Main} />
                <Route exact path="/canvas" component={CanvasGrid} />
                <Route exact path="/canvas/:category/:name" component={CanvasGrid} />
                <Route exact path="/upload" component={Upload}/>
            </div>
        );
    }
}

export default App;

ReactDOM.render(
    <HashRouter>
        <App />
    </HashRouter>, document.getElementById("app"));