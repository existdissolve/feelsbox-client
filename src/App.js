import React, { Component } from 'react';
import * as firebase from 'firebase';
import axios from 'axios';
import config from './config';
import './App.css';

var app = firebase.initializeApp(config);


function onSignIn (user) {

}

class App extends Component {
    constructor (props) {
        super(props);

        this.state = {
            loggedIn: false,
            data: null
        };
    }

    onClick (emoji) {
        axios.get(`https://feelsbox-server.herokuapp.com/emote/${emoji}`).then(response => {
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        });
    }


    componentWillMount () {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                // user is signed in
                var feelings = firebase.database().ref('feelings').once('value').then(snapshot => {
                    this.setState({
                        loggedIn: true,
                        data: snapshot.val()
                    });
                });
            } else {
                var provider = new firebase.auth.GoogleAuthProvider();
                firebase.auth().signInWithRedirect(provider);
            }
        });
    }

    render () {
        const {loggedIn, data} = this.state;

        if (!loggedIn || !data) {
            return (
                <div className="App">
                    <header className="App-header">
                        <h1 className="App-title">FeelsBox</h1>
                    </header>
                    <div className="g-signin2" data-onsuccess="onSignIn" data-theme="dark"></div>
                    <p className="App-intro">
                        Please login!
                    </p>
                </div>
            );
        }

        const keys = Object.keys(data);
        const len = keys.length;
        let rows = Math.floor(len / 3);
        rows = (len % 3) !== 0 ? rows + 1 : rows + 0;
        const groups = {};

        for (let i = 0; i < rows; i++) {
            for (let x = 0; x < 3; x++) {
                const position = (i * 3) + x;
                const value = data[keys[position]];

                if (value) {
                    if (!groups[i]) {
                        groups[i] = {};
                    }

                    groups[i][keys[position]] = value;
                } else {
                    break;
                }
            }
        }

        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">FeelsBox</h1>
                </header>
                <div className="section container">
                    <h2>Emojis</h2>
                    {Object.keys(groups).map(groupKey => {
                        const group = groups[groupKey];

                        return (
                            <div className="row" key={groupKey}>
                                {Object.keys(group).map(emojiKey => {
                                    const emoji = group[emojiKey];
                                    const grid = new Array(8).fill(true);
                                    return (
                                        <div className="col" key={emojiKey}>
                                            <a className="emoji" onClick={this.onClick.bind(this, emojiKey)}>
                                                {grid.map((line, index) => {
                                                    const row = new Array(8).fill(true);
                                                    return (
                                                        <span className="pixel-row" key={index}>
                                                            {row.map((pixel, idx) => {
                                                                let bgColor = '000000';
                                                                const pixelIndex = ((index * 8) + idx) + 1;

                                                                if (emoji[pixelIndex]) {
                                                                    bgColor = emoji[pixelIndex].c;
                                                                }

                                                                return (
                                                                    <span className="pixel" key={idx} style={{backgroundColor: `#${bgColor}`}}></span>
                                                                );
                                                            })}
                                                        </span>
                                                    );
                                                })}
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}

export default App;
