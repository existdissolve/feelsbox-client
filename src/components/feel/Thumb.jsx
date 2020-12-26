import {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {get} from 'lodash';
import classnames from 'classnames';

import {withStyles} from '@material-ui/core/styles';
import {withRouter} from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FlipToBackIcon from '@material-ui/icons/FlipToBack';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import AddBoxIcon from '@material-ui/icons/AddBox';
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
import IndeterminateCheckBoxIcon from '@material-ui/icons/IndeterminateCheckBox';
import RecordVoiceOverIcon from '@material-ui/icons/RecordVoiceOver';
import SettingsRemoteIcon from '@material-ui/icons/SettingsRemote';
import TextField from '@material-ui/core/TextField';
import {copyFeel, getFeels, removeFeel, sendFeel, subscribe, unsubscribe} from '-/graphql/feel';
import client from '-/graphql/client';

const styles = {
    emoji: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        width: 80,
        height: 80,
        margin: '10px auto',
        padding: 8,
        boxShadow: '0px 1px 5px 0px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.2), 0px 3px 1px -2px rgba(0, 0, 0, 0.2)',
        '&:active': {
            background: '#3f51b5'
        },
        '&.isSubscribed': {
            background: 'silver'
        }
    },
    gridList: {

    }
};

class Thumb extends Component {
    constructor(props) {
        super(props);

        this.timer;
        this.isDragging = false;

        this.state = {
            notification: '',
            anchorEl: undefined,
            dialogEl: undefined,
            deviceEl: undefined,
            notifyEl: undefined,
            selectedDevices: [],
            selectedFriends: []
        };
    }

    onEditClick = () => {
        const {feel = {}, history} = this.props;
        const {_id} = feel;

        history.push(`/canvas/${_id}`);
    };

    onRemoveClick = e => {
        this.onMenuClose();
        this.setState({dialogEl: e.target});
    };

    onPushClick = e => {
        this.onMenuClose();
        this.setState({deviceEl: e.target});
    };

    onNotifyClick = e => {
        this.onMenuClose();
        this.setState({notifyEl: e.target});
    };

    onNotifyFriendsClick = () => {
        const {notification, selectedFriends} = this.state;
        const _id = get(this.props, 'feel._id');

        client.mutate({
            mutation: sendFeel,
            variables: {
                _id,
                data: {
                    isNotification: true,
                    notification,
                    users: selectedFriends
                }
            }
        });

        this.onDialogClose();
    };

    onFriendCheck = e => {
        const {selectedFriends} = this.state;
        const friends = selectedFriends.slice();
        const {target} = e;
        const {checked, name} = target;

        if (checked) {
            friends.push(name);
        } else {
            const index = friends.findIndex(item => item === name);

            if (index !== -1) {
                friends.splice(index, 1);
            }
        }

        this.setState({selectedFriends: friends});
    };

    onPushDevicesClick = () => {
        const {selectedDevices} = this.state;
        const _id = get(this.props, 'feel._id');

        client.mutate({
            mutation: sendFeel,
            variables: {
                _id,
                data: {devices: selectedDevices}
            }
        });

        this.onDialogClose();
    };

    onDeviceCheck = e => {
        const {selectedDevices} = this.state;
        const devices = selectedDevices.slice();
        const {target} = e;
        const {checked, name} = target;

        if (checked) {
            devices.push(name);
        } else {
            const index = devices.findIndex(item => item === name);

            if (index !== -1) {
                devices.splice(index, 1);
            }
        }

        this.setState({selectedDevices: devices});
    };

    onMenuClose = () => {
        this.setState({anchorEl: undefined});
    };

    onDialogClose = () => {
        this.setState({
            deviceEl: undefined,
            dialogEl: undefined,
            notifyEl: undefined
        });
    };

    onDialogSubmit = async() => {
        const {feel = {}, showSnackbar} = this.props;
        const {_id} = feel;

        client.mutate({
            mutation: removeFeel,
            variables: {_id}
        }).then(() => {
            showSnackbar('Feel was successfully removed');
        });

        this.onDialogClose();
    };

    onCopyClick = () => {
        const {showSnackbar} = this.props;
        const _id = get(this.props, 'feel._id');

        client.mutate({
            mutation: copyFeel,
            awaitRefetchQueries: true,
            refetchQueries: [{
                fetchPolicy: 'network-only',
                query: getFeels
            }],
            variables: {_id}
        }).then(() => {
            showSnackbar('Added to My Feels!');
        });

        this.onMenuClose();
    };

    onSubscribeClick = () => {
        const {showSnackbar} = this.props;
        const _id = get(this.props, 'feel._id');

        client.mutate({
            mutation: subscribe,
            variables: {_id}
        }).then(() => {
            showSnackbar('Added to Favs!');
        });

        this.onMenuClose();
    };

    onUnsubscribeClick = () => {
        const {showSnackbar} = this.props;
        const _id = get(this.props, 'feel._id');

        client.mutate({
            mutation: unsubscribe,
            variables: {_id}
        }).then(() => {
            showSnackbar('Removed from Favs');
        });

        this.onMenuClose();
    };

    onTouchStart = e => {
        const {currentTarget} = e;

        this.timer = setTimeout(() => {
            clearTimeout(this.timer);

            this.timer = null;
            this.setState({anchorEl: currentTarget});
        }, 500);
    };

    onTouchEnd = () => {
        const _id = get(this.props, 'feel._id');

        if (!this.timer) {
            return false;
        }

        if (this.isDragging) {
            this.isDragging = false;
            return false;
        }

        clearTimeout(this.timer);

        this.onTap(_id);
    };

    onTap = _id => {
        client.mutate({
            mutation: sendFeel,
            variables: {_id}
        });
    };

    onTouchMove = () => {
        clearTimeout(this.timer);

        this.isDragging = true;
    };

    onNotificationChange = e => {
        const notification = get(e, 'target.value');

        this.setState({notification});
    };

    render() {
        const {anchorEl, deviceEl, dialogEl, notification, notifyEl, selectedDevices, selectedFriends} = this.state;
        const {classes, feel} = this.props;
        const devices = get(this.props, 'devices', []);
        const friends = get(this.props, 'friends', []);
        const {frames = [], isOwner, isSubscribed, isSubscriptionOwner, name} = feel;
        const frame = frames.find(frame => frame.isThumb) || frames[0];
        const {pixels} = frame;
        const grid = new Array(64).fill(true);
        const emojiCls = classnames(classes.emoji, {
            isSubscribed
        });
        const edit = (
            <MenuItem onClick={this.onEditClick} key="edit">
                <ListItemIcon>
                    <EditIcon />
                </ListItemIcon>
                Edit Feel
            </MenuItem>
        );
        const remove = (
            <MenuItem onClick={this.onRemoveClick} key="remove">
                <ListItemIcon>
                    <CloseIcon />
                </ListItemIcon>
                Remove Feel
            </MenuItem>
        );
        const push = (
            <MenuItem onClick={this.onPushClick} key="push">
                <ListItemIcon>
                    <SettingsRemoteIcon />
                </ListItemIcon>
                Send to Devices
            </MenuItem>
        );
        const notify = (
            <MenuItem onClick={this.onNotifyClick} key="notification">
                <ListItemIcon>
                    <RecordVoiceOverIcon />
                </ListItemIcon>
                Send to Friends
            </MenuItem>
        );
        const saveToFavs = (
            <MenuItem onClick={this.onSubscribeClick} key="save_feel">
                <ListItemIcon>
                    <AddBoxIcon />
                </ListItemIcon>
                Save to Favs
            </MenuItem>
        );
        const removeFromFavs = (
            <MenuItem onClick={this.onUnsubscribeClick} key="remove_feel">
                <ListItemIcon>
                    <IndeterminateCheckBoxIcon />
                </ListItemIcon>
                Remove from Favs
            </MenuItem>
        );
        const copyFeel = (
            <MenuItem onClick={this.onCopyClick} key="copy_feel_save">
                <ListItemIcon>
                    <FlipToBackIcon />
                </ListItemIcon>
                Copy to My Feels
            </MenuItem>
        );

        const menu = [];
        const actions = [edit, remove, push, notify];

        if (isOwner) {
            menu.push(...actions);
        } else {
            menu.push(copyFeel);
            menu.push(push);

            if (!isSubscribed) {
                menu.push(saveToFavs);
            } else if (isSubscriptionOwner) {
                menu.push(removeFromFavs);
            }
        }


        return (
            <Fragment>
                <GridListTile style={{width: '33%'}}>
                    <div>
                        <a id={name} className={emojiCls} onTouchStart={this.onTouchStart} onTouchEnd={this.onTouchEnd} onTouchMove={this.onTouchMove}>
                            <GridList className={classes.gridList} cols={8} spacing={0} cellHeight={8}>
                                {grid.map((val, idx) => {
                                    let color = '000000';

                                    const pixel = pixels.find(pixel => pixel.position === idx);

                                    if (pixel) {
                                        ({color} = pixel);
                                    }

                                    return <GridListTile key={`${name}-${idx}`} style={{width: '8px', backgroundColor: `#${color}`}} />;
                                })}
                            </GridList>
                        </a>
                    </div>
                </GridListTile>
                <Menu anchorEl={anchorEl} keepMounted={false} open={Boolean(anchorEl)} onClose={this.onMenuClose}>
                    {menu}
                </Menu>
                <Dialog open={Boolean(dialogEl)} onClose={this.onDialogClose} keepMounted={false}>
                    <DialogTitle>Remove Feel?</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to remove this Feel from your collection permanently?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onDialogClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.onDialogSubmit} color="primary" autoFocus>
                            Agree
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={Boolean(deviceEl)} onClose={this.onDialogClose} keepMounted={false}>
                    <DialogTitle>Send to Devices</DialogTitle>
                    <DialogContent>
                        <FormControl component="fieldset" className={classes.formControl}>
                            <FormGroup>
                                {devices.map(device => {
                                    const {_id: deviceId, name} = device;
                                    const isChecked = selectedDevices.includes(deviceId);

                                    return (
                                        <FormControlLabel key={deviceId} control={<Checkbox checked={isChecked} onChange={this.onDeviceCheck} name={deviceId} />} label={name} />
                                    );
                                })}
                            </FormGroup>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onDialogClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.onPushDevicesClick} color="primary" autoFocus>
                            Send
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={Boolean(notifyEl)} onClose={this.onDialogClose} keepMounted={false}>
                    <DialogTitle>Send to Friends</DialogTitle>
                    <DialogContent>
                        <FormControl component="fieldset" className={classes.formControl}>
                            <FormGroup>
                                {friends.map(friend => {
                                    const {_id: userId, email, name} = friend;
                                    const isChecked = selectedFriends.includes(userId);

                                    return (
                                        <FormControlLabel key={userId} control={<Checkbox checked={isChecked} onChange={this.onFriendCheck} name={userId} />} label={name || email} />
                                    );
                                })}
                            </FormGroup>
                            <TextField
                                autoFocus={true}
                                label="Message"
                                fullWidth={true}
                                onChange={this.onNotificationChange}
                                value={notification}
                                name="notification"
                                variant="outlined" />
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onDialogClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.onNotifyFriendsClick} color="primary" autoFocus>
                            Send
                        </Button>
                    </DialogActions>
                </Dialog>
            </Fragment>
        );
    }
}

Thumb.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withRouter(
    withStyles(styles)(Thumb)
);