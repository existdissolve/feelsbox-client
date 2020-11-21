import {Component, Fragment} from 'react';
import {withStyles} from '@material-ui/core/styles';
import {graphql} from 'react-apollo';
import {compose} from 'recompose';
import {withRouter} from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import FlashOffIcon from '@material-ui/icons/FlashOff';
import HistoryIcon from '@material-ui/icons/History';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import RedoIcon from '@material-ui/icons/Redo';
import SettingsRemoteIcon from '@material-ui/icons/SettingsRemote';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import {Link} from 'react-router-dom';
import {get} from 'lodash';

import AppBar from '-/components/AppBar';
import {getDevices, submitAccessCode} from '-/graphql/device';
import {setDefaultDevice} from '-/graphql/user';
import {restart, turnOff} from '-/graphql/device';

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.background.paper
    }
});

class DeviceList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            anchorEl: null,
            code: undefined,
            dialogOpen: false
        };
    }

    onCodeChange = e => {
        const code = get(e, 'target.value');

        this.setState({code});
    };

    onCodeSubmit = async() => {
        const {code} = this.state;
        const {showSnackbar, submitAccessCode} = this.props;

        try {
            await submitAccessCode({
                awaitRefetchQueries: true,
                refetchQueries: [{
                    query: getDevices
                }],
                variables: {
                    code: parseInt(code)
                }
            });

            showSnackbar('Device Code was registered successfully!');

            this.onDialogClose();
        } catch (e) {
            showSnackbar(e.message.replace('GraphQL error: ', ''));
        }

    };

    onDefaultClick = async _id => {
        const {setDefaultDevice, showSnackbar} = this.props;

        await setDefaultDevice({
            awaitRefetchQueries: true,
            refetchQueries: [{
                query: getDevices
            }],
            variables: {_id}
        });

        showSnackbar('Default device set successfully!');
    };

    onDeviceClick = _id => {
        const {history} = this.props;

        history.push(`/devices/${_id}`);
    };

    onDialogClose = () => {
        this.setState({dialogOpen: false});
    };

    onEnterCodeClick = () => {
        this.setState({
            anchorEl: null,
            dialogOpen: true
        });
    };

    onMenuClick = e => {
        const {currentTarget} = e;

        this.setState({anchorEl: currentTarget});
    };

    onMenuClose = () => {
        this.setState({anchorEl: null});
    };

    onRestartClick = _id => {
        const {restart} = this.props;

        restart({
            variables: {_id}
        });
    };

    onTurnOffClick = _id => {
        const {turnOff} = this.props;

        turnOff({
            variables: {_id}
        });
    };

    render() {
        const {anchorEl, dialogOpen} = this.state;
        const {classes} = this.props;
        const devices = get(this.props, 'data.devices', []);
        const groupedDevices = devices.reduce((groups, device) => {
            const {isOwner} = device;
            const group = isOwner ? 'mine' : 'others';

            groups[group].devices.push(device);

            return groups;
        }, {
            mine: {
                label: 'My Devices',
                devices: []
            },
            others: {
                label: 'Other Devices',
                devices: []
            }
        });
        const menu = (
            <IconButton onClick={this.onMenuClick}>
                <MoreVertIcon />
            </IconButton>
        );

        return (
            <div>
                <AppBar title="Devices" iconRenderer={menu} />
                <Menu anchorEl={anchorEl} keepMounted={false} open={Boolean(anchorEl)} onClose={this.onMenuClose}>
                    <MenuItem onClick={this.onEnterCodeClick}>
                        <ListItemIcon>
                            <LockOpenIcon />
                        </ListItemIcon>
                        Enter Device Code
                    </MenuItem>
                </Menu>
                <Dialog open={dialogOpen} onClose={this.onDialogClose}>
                    <DialogTitle>Enter Device Code</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            If you received a code from a friend or family member, enter it here to start sending feels!
                        </DialogContentText>
                        <TextField autoFocus margin="dense" label="Access Code" fullWidth onChange={this.onCodeChange} type="number" />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onDialogClose}>Cancel</Button>
                        <Button onClick={this.onCodeSubmit}>Submit</Button>
                    </DialogActions>
                </Dialog>
                <div className={classes.root}>
                    <List component="div">
                        {Object.keys(groupedDevices).map(key => {
                            const group = groupedDevices[key];
                            const {label, devices = []} = group;
                            const isMine = key === 'mine';

                            return (
                                <Fragment key={key}>
                                    <ListSubheader>{label}</ListSubheader>
                                    {devices.map((device, idx) => {
                                        const {_id, isDefault, name} = device;

                                        return (
                                            <Fragment key={_id}>
                                                <ListItem>
                                                    <ListItemIcon button={isMine || undefined} onClick={isMine ? this.onDeviceClick.bind(this, _id) : undefined}>
                                                        {isMine ?
                                                            <AccountCircleIcon />
                                                            :
                                                            <SupervisedUserCircleIcon />
                                                        }
                                                    </ListItemIcon>
                                                    <ListItemText primary={name} />
                                                    {isMine &&
                                                        <Fragment>
                                                            <ListItemIcon onClick={this.onRestartClick.bind(this, _id)}>
                                                                <RedoIcon />
                                                            </ListItemIcon>
                                                            <ListItemIcon onClick={this.onTurnOffClick.bind(this, _id)}>
                                                                <FlashOffIcon />
                                                            </ListItemIcon>
                                                            <Link to={`/devices/${_id}/history`}>
                                                                <ListItemSecondaryAction style={{marginRight: 30}}>
                                                                    <HistoryIcon />
                                                                </ListItemSecondaryAction>
                                                            </Link>
                                                        </Fragment>
                                                    }
                                                    <ListItemSecondaryAction edge="end">
                                                        <SettingsRemoteIcon onClick={this.onDefaultClick.bind(this, _id)} style={{color: isDefault ? 'green' : undefined}} />
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                                {idx !== devices.length - 1 && <Divider />}
                                            </Fragment>
                                        );
                                    })}
                                </Fragment>
                            );
                        })}
                    </List>
                </div>
            </div>
        );
    }
}

export default withRouter(
    compose(
        graphql(getDevices, {
            options: {
                notifyOnNetworkStatusChange: true
            }
        }),
        graphql(restart, {name: 'restart'}),
        graphql(submitAccessCode, {name: 'submitAccessCode'}),
        graphql(setDefaultDevice, {name: 'setDefaultDevice'}),
        graphql(turnOff, {name: 'turnOff'}),
        withStyles(styles),

    )(DeviceList)
);
