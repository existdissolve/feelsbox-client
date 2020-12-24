/* eslint-disable no-undef */
import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';

import AppBar from '-/components/AppBar';

const styles = () => ({
    root: {
        padding: '50px 30px',
        textAlign: 'center'
    }
});

class Splash extends React.Component {
    render() {
        const {classes, message} = this.props;

        return (
            <div>
                <CssBaseline />
                <AppBar title="FeelsBox" includeNav={false} />
                <div className={classes.root}>
                    <CircularProgress />
                    <Typography variant="h5" gutterBottom={true} paragraph={false} align="center">
                        {message}
                    </Typography>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(Splash);
