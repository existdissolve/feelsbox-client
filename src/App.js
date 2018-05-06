import React, { Component } from 'react';
import ReactDOM from "react-dom";
import * as firebase from 'firebase';
import {HashRouter} from 'react-router-dom';

import Login from '-/components/Login';
import Landing from '-/components/Landing';
import config from '-/config';


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
            return <Login />
        }

        return <Landing />
    }
}

export default App;

ReactDOM.render(
    <HashRouter>
        <App />
    </HashRouter>, document.getElementById("app")
);