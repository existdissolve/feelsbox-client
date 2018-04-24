import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import Navigation from '-/components/Navigation';

const styles = {
    root: {
        flexGrow: 1
    },
    flex: {
        flex: 1
    }
};

function FBAppBar(props) {
    const {classes, title} = props;
    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <Navigation />
                    <Typography variant="title" color="inherit" className={classes.flex}>
                        {title}
                    </Typography>
                </Toolbar>
            </AppBar>
        </div>
    );
}

FBAppBar.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(FBAppBar);
