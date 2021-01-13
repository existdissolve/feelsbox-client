/* eslint-disable no-undef */
import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {Redirect} from 'react-router-dom';

import AppBar from '-/components/AppBar';

const styles = () => ({
    root: {
        padding: '80px 30px'
    }
});

class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {loginSuccess: false};
    }

    onGoogleLoginClick = () => {
        const auth2 = gapi.auth2.getAuthInstance();

        auth2.signIn({
            prompt: 'select_account'
        });
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
                <AppBar title="Login to FeelsBox" includeNav={false} />
                <div className={classes.root}>
                    <Typography variant="h3" gutterBottom={true} paragraph={false}>
                        Hi there!
                    </Typography>
                    <Typography component="p" gutterBottom={true} paragraph={true}>
                        To begin using your FeelsBox, login with your Google account.
                    </Typography>
                    <Button variant="contained" onClick={this.onGoogleLoginClick} startIcon={<AccountCircleIcon />}>Login with Google</Button>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(Login);
