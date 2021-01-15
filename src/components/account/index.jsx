import {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import {withRouter} from 'react-router-dom';
import ListSubheader from '@material-ui/core/ListSubheader';

import Form from '-/components/account/Form';
import Messages from '-/components/account/List';

import AppBar from '-/components/AppBar';

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        marginTop: 56,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'hidden',
        height: 'calc(100vh - 56px)'
    },
    subheader: {
        backgroundColor: theme.palette.grey.A400,
        borderTop: 'solid 1px',
        borderTopColor: theme.palette.grey['900'],
        borderBottom: 'solid 1px',
        borderBottomColor: theme.palette.grey['900'],
        lineHeight: '30px'
    }
});

class Account extends Component {
    render() {
        const {classes, ...rest} = this.props;

        return (
            <div style={{overflow: 'hidden'}}>
                <AppBar title="My Account" />
                <div className={classes.root}>
                    <ListSubheader className={classes.subheader}>App Preferences</ListSubheader>
                    <Form {...rest} />
                    <ListSubheader className={classes.subheader}>Messages</ListSubheader>
                    <Messages {...rest} />
                </div>
            </div>
        );
    }
}

export default withRouter(
    withStyles(styles)(Account)
);
