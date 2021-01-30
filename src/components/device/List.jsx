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
import SystemUpdateIcon from '@material-ui/icons/SystemUpdate';
import {get} from 'lodash';

import {AppBar, IconButton, Loading} from '-/components/shared';
import {setDefaultDevice} from '-/graphql/user';
import {getDevices, restart, setBrightness, submitAccessCode, turnOff, updateDevice} from '-/graphql/device';

const styles = theme => ({
    container: {
        display: 'flex',
        height: '100vh',
        flexDirection: 'column',
        overflow: 'hidden'
    },
    root: {
        flex: 1,
        position: 'relative',
        padding: '0px !important',
        backgroundColor: theme.palette.background.paper,
        overflowY: 'auto',
        marginTop: 56
    },
    icon: {
        maxWidth: 40,
        minWidth: 20
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

class DeviceList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            actionsEl: null,
            activeDevice: null,
            anchorEl: null,
            brightness: 100,
            brightnessOpen: false,
            code: undefined,
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
        const {brightness, activeDevice} = this.state;
        const {showSnackbar, setBrightness} = this.props;
        const {_id} = activeDevice;

        try {
            await setBrightness({
                variables: {
                    _id,
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
            activeDevice: null,
            brightnessOpen: false,
            dialogOpen: false
        });
    };

    onEnterCodeClick = () => {
        this.setState({
            anchorEl: null,
            dialogOpen: true
        });
    };

    onActionsClick = (device, e) => {
        const {currentTarget} = e;

        this.setState({
            actionsEl: currentTarget,
            activeDevice: device
        });
    };

    onMenuClick = e => {
        const {currentTarget} = e;

        this.setState({anchorEl: currentTarget});
    };

    onMenuClose = () => {
        this.setState({
            activeDevice: null,
            actionsEl: null,
            anchorEl: null
        });
    };

    onRestartClick = () => {
        const {restart, showSnackbar} = this.props;
        const {activeDevice} = this.state;
        const _id = get(activeDevice, '_id');

        restart({
            variables: {_id}
        }).then(() => {
            this.onMenuClose();
            showSnackbar('Device will restart shortly');
        });
    };

    onSetBrightnessClick = device => {
        this.setState({
            brightnessOpen: true,
            activeDevice: device
        });
    };

    onTurnOffClick = _id => {
        const {showSnackbar, turnOff} = this.props;

        turnOff({
            variables: {_id}
        }).then(() => {
            this.onMenuClose();
            showSnackbar('Device display was turned off successfully!');
        });
    };

    onUpdateClick = () => {
        const {showSnackbar, updateDevice} = this.props;
        const {activeDevice} = this.state;
        const _id = get(activeDevice, '_id');

        updateDevice({
            variables: {_id}
        }).then(() => {
            this.onMenuClose();
            showSnackbar('Device will update and restart shortly');
        });
    };

    onViewHistoryClick = () => {
        const {activeDevice} = this.state;
        const _id = get(activeDevice, '_id');

        window.location = `/#/devices/${_id}/history`;
    };

    render() {
        const {actionsEl, activeDevice, anchorEl, brightness, brightnessOpen, dialogOpen} = this.state;
        const {classes} = this.props;
        const devices = get(this.props, 'data.devices', []);
        const loading = get(this.props, 'data.loading');
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
            <IconButton Icon={MoreVertIcon} onClick={this.onMenuClick} title="More actions" />
        );
        const isUpdateable = get(activeDevice, 'capabilities.updates');

        return (
            <div className={classes.container}>
                <AppBar title="Devices" iconRenderer={menu} />
                <Menu anchorEl={anchorEl} keepMounted={false} open={Boolean(anchorEl)} onClose={this.onMenuClose}>
                    <MenuItem onClick={this.onEnterCodeClick}>
                        <ListItemIcon>
                            <LockOpenIcon />
                        </ListItemIcon>
                        Enter Device Code
                    </MenuItem>
                </Menu>
                <Menu anchorEl={actionsEl} keepMounted={false} open={Boolean(actionsEl)} onClose={this.onMenuClose}>
                    <MenuItem onClick={this.onRestartClick}>
                        <ListItemIcon>
                            <PowerSettingsNewIcon />
                        </ListItemIcon>
                        Restart Device
                    </MenuItem>
                    {isUpdateable &&
                        <MenuItem onClick={this.onUpdateClick}>
                            <ListItemIcon>
                                <SystemUpdateIcon />
                            </ListItemIcon>
                            Update Device
                        </MenuItem>
                    }
                    <MenuItem onClick={this.onViewHistoryClick}>
                        <ListItemIcon>
                            <HistoryIcon />
                        </ListItemIcon>
                        Device History
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
                        <Button onClick={this.onDialogClose} color="default" variant="contained" size="small">Cancel</Button>
                        <Button onClick={this.onCodeSubmit} color="secondary" variant="contained" size="small">Submit</Button>
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
                        <Button onClick={this.onDialogClose} color="default" variant="contained" size="small">Cancel</Button>
                        <Button onClick={this.onBrightnessSubmit} color="secondary" variant="contained" size="small">Submit</Button>
                    </DialogActions>
                </Dialog>
                <div className={classes.root}>
                    {loading && <Loading message="Loading Your Devices..." />}
                    {!loading &&
                        <List component="div" style={{padding: 0}}>
                            {Object.keys(groupedDevices).map(key => {
                                const group = groupedDevices[key];
                                const {label, devices = []} = group;
                                const isMine = key === 'mine';

                                return (
                                    <Fragment key={key}>
                                        <ListSubheader className={classes.subheader}>{label}</ListSubheader>
                                        {devices.map((device, idx) => {
                                            const {_id, isDefault, name} = device;

                                            return (
                                                <Fragment key={_id}>
                                                    <ListItem>
                                                        <ListItemIcon onClick={isMine ? this.onDeviceClick.bind(this, _id) : undefined}>
                                                            {isMine ?
                                                                <AccountCircleIcon />
                                                                :
                                                                <SupervisedUserCircleIcon />
                                                            }
                                                        </ListItemIcon>
                                                        <ListItemText primary={name} style={{flexGrow: 1}} />
                                                        {isMine &&
                                                            <Fragment>
                                                                <ListItemIcon onClick={this.onTurnOffClick.bind(this, _id)} className={classes.icon}>
                                                                    <IconButton Icon={FlashOffIcon} title="Turn off display" />
                                                                </ListItemIcon>
                                                                <ListItemIcon onClick={this.onSetBrightnessClick.bind(this, device)} className={classes.icon}>
                                                                    <IconButton Icon={SettingsBrightnessIcon} title="Change device brightness" />
                                                                </ListItemIcon>
                                                                <ListItemIcon onClick={this.onActionsClick.bind(this, device)} className={classes.icon}>
                                                                    <IconButton Icon={MoreVertIcon} title="See more actions" />
                                                                </ListItemIcon>
                                                            </Fragment>
                                                        }
                                                        <ListItemIcon edge="end" className={classes.icon} onClick={this.onDefaultClick.bind(this, _id)}>
                                                            <IconButton color={isDefault ? 'secondary' : 'action'} Icon={SettingsRemoteIcon} title="Make default device" />
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
                    }
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
        graphql(updateDevice, {name: 'updateDevice'}),
        withStyles(styles),

    )(DeviceList)
);
