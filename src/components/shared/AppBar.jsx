import {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import {AppBar, Toolbar, Typography} from '@material-ui/core';

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
    const {classes, extraContent, title, iconRenderer = false, includeNav = true, position = 'fixed'} = props;
    return (
        <div className={classes.root}>
            <AppBar position={position}>
                <Toolbar>
                    {includeNav && <Navigation />}
                    <Typography variant="h6" color="inherit" className={classes.flex}>
                        {title}
                    </Typography>
                    {iconRenderer}
                </Toolbar>
                {extraContent}
            </AppBar>
        </div>
    );
}

FBAppBar.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(FBAppBar);
