import React from 'react';
import {withStyles} from 'material-ui/styles';
import CssBaseline from 'material-ui/CssBaseline';
import {CircularProgress} from 'material-ui/Progress';

import AppBar from '-/components/AppBar';

const styles = theme => ({
    root: {
        padding: '10px'
    },
    text: {
        fontSize: 14,
        fontFamily: 'sans-serif'
    },
    progress: {
        margin: '200px auto',
        display: 'block'
    }
});

class Login extends React.Component {
    render() {
        const {classes} = this.props;

        return (
            <div>
                <CssBaseline />
                <AppBar title="Login to Feelsbox Manager" includeNav={false} />
                <div className={classes.root}>
                    <div className="g-signin2" data-onsuccess="onSignIn" data-theme="dark"></div>
                    <CircularProgress className={this.props.classes.progress} size="50%" />
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(Login);
