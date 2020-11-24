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
import Grid from '@material-ui/core/Grid';
import HistoryIcon from '@material-ui/icons/History';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Slider from '@material-ui/core/Slider';
import TextField from '@material-ui/core/TextField';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import BrightnessLowIcon from '@material-ui/icons/BrightnessLow';
import BrightnessHighIcon from '@material-ui/icons/BrightnessHigh';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import SettingsBrightnessIcon from '@material-ui/icons/SettingsBrightness';
import SettingsRemoteIcon from '@material-ui/icons/SettingsRemote';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import {get} from 'lodash';

import AppBar from '-/components/AppBar';
import {setDefaultDevice} from '-/graphql/user';
import {getDevices, restart, setBrightness, submitAccessCode, turnOff} from '-/graphql/device';

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.background.paper
    },
    icon: {
        minWidth: 24,
        padding: 5
    }
});

class DeviceList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            anchorEl: null,
            brightness: 100,
            brightnessOpen: false,
            code: undefined,
            currentDevice: null,
            dialogOpen: false
        };
    }

    formatSliderLabel = value => {
        return `${value}%`;
    };

    onBrightnessChange = (e, value) => {
        this.setState({brightness: value});
    };

    onBrightnessSubmit = async() => {
        const {brightness, currentDevice} = this.state;
        const {showSnackbar, setBrightness} = this.props;

        try {
            await setBrightness({
                variables: {
                    _id: currentDevice,
                    brightness
                }
            });

            showSnackbar('Device brightness was set successfully!');

            this.onDialogClose();
        } catch (e) {
            showSnackbar(e.message.replace('GraphQL error: ', ''));
        }
    };

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
        this.setState({
            brightnessOpen: false,
            currentDevice: null,
            dialogOpen: false
        });
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

    onSetBrightnessClick = _id => {
        this.setState({
            brightnessOpen: true,
            currentDevice: _id
        });
    };

    onTurnOffClick = _id => {
        const {turnOff} = this.props;

        turnOff({
            variables: {_id}
        });
    };

    onViewHistoryClick = _id => {
        window.location = `/#/devices/${_id}/history`;
    };

    render() {
        const {anchorEl, brightness, brightnessOpen, dialogOpen} = this.state;
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
                <Dialog open={dialogOpen} keepMounted={false} onClose={this.onDialogClose}>
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
                <Dialog open={brightnessOpen} keepMounted={false} onClose={this.onDialogClose}>
                    <DialogTitle>Set Device Brightness</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item>
                                <BrightnessLowIcon />
                            </Grid>
                            <Grid item xs>
                                <Slider
                                    value={brightness}
                                    onChange={this.onBrightnessChange}
                                    step={10}
                                    min={10}
                                    max={100}
                                    valueLabelFormat={this.formatSliderLabel} />
                            </Grid>
                            <Grid item>
                                <BrightnessHighIcon />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onDialogClose}>Cancel</Button>
                        <Button onClick={this.onBrightnessSubmit}>Submit</Button>
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
                                                    <ListItemText primary={name} style={{flexGrow: 1}} />
                                                    {isMine &&
                                                        <Fragment>
                                                            <ListItemIcon onClick={this.onRestartClick.bind(this, _id)} className={classes.icon}>
                                                                <PowerSettingsNewIcon />
                                                            </ListItemIcon>
                                                            <ListItemIcon onClick={this.onTurnOffClick.bind(this, _id)} className={classes.icon}>
                                                                <FlashOffIcon />
                                                            </ListItemIcon>
                                                            <ListItemIcon onClick={this.onSetBrightnessClick.bind(this, _id)} className={classes.icon}>
                                                                <SettingsBrightnessIcon />
                                                            </ListItemIcon>
                                                            <ListItemIcon onClick={this.onViewHistoryClick.bind(this, _id)} className={classes.icon}>
                                                                <HistoryIcon />
                                                            </ListItemIcon>
                                                        </Fragment>
                                                    }
                                                    <ListItemIcon edge="end" className={classes.icon}>
                                                        <SettingsRemoteIcon onClick={this.onDefaultClick.bind(this, _id)} style={{color: isDefault ? 'green' : undefined}} />
                                                    </ListItemIcon>
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
        graphql(setBrightness, {name: 'setBrightness'}),
        graphql(setDefaultDevice, {name: 'setDefaultDevice'}),
        graphql(turnOff, {name: 'turnOff'}),
        withStyles(styles),

    )(DeviceList)
);
