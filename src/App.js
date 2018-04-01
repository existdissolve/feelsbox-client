import React, { Component } from 'react';
import * as firebase from 'firebase';
import axios from 'axios';
import config from './config';
import './App.css';

var app = firebase.initializeApp(config);

const categoryLabels = {
    food: 'Food',
    drink: 'Drink',
    event: 'Holidays and Events',
    misc: 'Miscellaneous'
}

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

    renderCategory(categoryKey, category) {
        const keys = Object.keys(category);
        const len = keys.length;
        let rows = Math.floor(len / 3);
        rows = (len % 3) !== 0 ? rows + 1 : rows + 0;
        const groups = {};

        for (let i = 0; i < rows; i++) {
            for (let x = 0; x < 3; x++) {
                const position = (i * 3) + x;
                const value = category[keys[position]];

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
            <div key={categoryKey}>
                <div className="category">{categoryLabels[categoryKey]}</div>
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

                                                            if (emoji.pixels[pixelIndex]) {
                                                                bgColor = emoji.pixels[pixelIndex].c;
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
        )
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

        const categories = {};

        Object.keys(data).forEach(key => {
            const item = data[key];
            const category = item.category;

            if (!categories[category]) {
                categories[category] = {};
            }

            categories[category][key] = item;
        });

        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">FeelsBox</h1>
                </header>
                <div className="section container">
                    <h2>Emojis</h2>
                    {Object.keys(categories).map(categoryKey => {
                        return this.renderCategory(categoryKey, categories[categoryKey]);
                    })}
                </div>
                <div className="section container">
                    <h2>Upload Emoji</h2>
                    <form action="https://feelsbox-server.herokuapp.com/upload" method="POST" encType="multipart/form-data" target="_blank">
                        <div className="row">
                            <div className="form-group">
                                <label>Name:</label>
                                <input type="text" name="emoji" className="form-control" />
                            </div>
                            <div className="form-group">
                                <label>Category:</label>
                                <select name="category" className="form-control">
                                    <option value="misc">Miscellaneous</option>
                                    <option value="food">Food</option>
                                    <option value="drink">Drinks</option>
                                    <option value="holiday">Holiday</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>File:</label>
                                <input type="file" name="png" className="form-control" />
                            </div>
                        </div>
                        <input type="submit" href="#" className="btn btn-primary" onClick={this.onUploadSubmit} value="Upload" />
                    </form>
                </div>
            </div>
        );
    }
}

export default App;
