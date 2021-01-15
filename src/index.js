import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {hot} from 'react-hot-loader/root';
import {HashRouter} from 'react-router-dom';
import {ApolloProvider} from 'react-apollo';
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';

import client from '-/graphql/client';
import Landing from '-/components/Landing';

window.oncontextmenu = function() {
    return false;
};

const themes = {
    blue: {
        palette: {
            type: 'dark'
        }
    },
    sorbet: {
        palette: {
            primary: {
                main: '#e91e63'
            },
            secondary: {
                main: '#d500f9'
            },
            type: 'dark'
        }
    },
    grassy: {
        palette: {
            primary: {
                main: '#4caf50'
            },
            secondary: {
                main: '#c6ff00'
            },
            type: 'dark'
        }
    },
    ocean: {
        palette: {
            primary: {
                main: '#009688'
            },
            secondary: {
                main: '#00e5ff'
            },
            type: 'dark'
        }
    },
    sunrise: {
        palette: {
            primary: {
                main: '#ff9800'
            },
            secondary: {
                main: '#ffea00'
            },
            type: 'dark'
        }
    }
};

class Theme extends Component {
    constructor(props) {
        super(props);

        const theme = localStorage.getItem('appTheme');

        this.state = {
            theme: theme || 'blue'
        };
    }

    changeTheme = theme => {
        this.setState({theme});
    };

    render() {
        const {theme} = this.state;
        const activeTheme = createMuiTheme({
            ...themes[theme]
        });
        return (
            <ThemeProvider theme={activeTheme}>
                <HashRouter>
                    <App changeTheme={this.changeTheme} />
                </HashRouter>
            </ThemeProvider>
        );
    }
}

class App extends Component {
    render() {
        return <Landing {...this.props} />;
    }
}

ReactDOM.render(
    <ApolloProvider client={client}>
        <Theme />
    </ApolloProvider>, document.getElementById('app')
);

export default hot(App);