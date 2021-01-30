/* eslint-disable no-undef */
import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {CssBaseline, CircularProgress, Typography} from '@material-ui/core';

import {AppBar} from '-/components/shared';

const styles = () => ({
    root: {
        height: '100%',
        padding: '50% 0',
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
