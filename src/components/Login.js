/* eslint-disable no-undef */
import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {Redirect} from 'react-router-dom';

import AppBar from '-/components/AppBar';

const styles = () => ({
    root: {
        padding: '10px'
    },
    text: {
        fontSize: 14,
        fontFamily: 'sans-serif'
    }
});

class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {loginSuccess: false};
    }
    onFacebookLoginClick = async() => {
        const config = {
            return_scopes: true,
            scope: 'email'
        };

        FB.login(response => {
            const {status} = response;

            this.setState({loginSuccess: status === 'connected'});
        }, config);
    };

    onFacebookLogoutClick = async() => {
        FB.logout(response => {
            console.log(response);
        });
    };

    onGoogleLoginClick = () => {
        const auth2 = gapi.auth2.getAuthInstance();

        auth2.signIn({
            prompt: 'select_account'
        });
    };

    onGoogleLogoutClick = () => {
        const auth2 = gapi.auth2.getAuthInstance();

        auth2.signOut();
    };

    render() {
        const {classes} = this.props;
        const {loginSuccess} = this.state;

        if (loginSuccess) {
            return <Redirect to="/" push={true} />;
        }

        return (
            <div>
                <CssBaseline />
                <AppBar title="Login to Feelsbox Manager" includeNav={false} />
                <div className={classes.root}>
                    <Typography component="p" gutterBottom={true} paragraph={true}>
                        To begin using your Feelsbox, login using either Facebook or Google.
                    </Typography>
                    <Button variant="contained" onClick={this.onGoogleLoginClick} startIcon={<Icon className="fab fa-google" />}>Login with Google</Button>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(Login);
