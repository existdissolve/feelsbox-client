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

const theme = createMuiTheme({
    palette: {
        type: 'dark'
    }
});

class App extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <Landing />;
    }
}

ReactDOM.render(
    <ApolloProvider client={client}>
        <ThemeProvider theme={theme}>
            <HashRouter>
                <App />
            </HashRouter>
        </ThemeProvider>
    </ApolloProvider>, document.getElementById('app')
);

export default hot(App);