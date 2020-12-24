import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import Navigation from '-/components/Navigation';

const styles = {
    root: {
        flexGrow: 0
    },
    flex: {
        flex: 1
    }
};

function FBAppBar(props) {
    const {classes, title, iconRenderer = false, includeNav = true} = props;
    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    {includeNav && <Navigation />}
                    <Typography variant="h6" color="inherit" className={classes.flex}>
                        {title}
                    </Typography>
                    {iconRenderer}
                </Toolbar>
            </AppBar>
        </div>
    );
}

FBAppBar.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(FBAppBar);
