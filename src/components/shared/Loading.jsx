/* eslint-disable no-undef */
import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = () => ({
    loading: {
        height: '100%',
        textAlign: 'center',
        padding: '50% 0'
    }
});

class Loading extends React.Component {
    render() {
        const {classes, message} = this.props;

        return (
            <div className={classes.loading}>
                <CircularProgress />
                <Typography variant="h5" gutterBottom={true} paragraph={false} align="center">
                    {message}
                </Typography>
            </div>
        );
    }
}

export default withStyles(styles)(Loading);
