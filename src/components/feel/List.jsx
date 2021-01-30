import {Component, Fragment} from 'react';
import {withStyles} from '@material-ui/core/styles';
import {Typography} from '@material-ui/core';
import {graphql} from 'react-apollo';
import {compose} from 'recompose';
import {withRouter} from 'react-router-dom';
import {get} from 'lodash';

import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import GridList from '@material-ui/core/GridList';
import InputAdornment from '@material-ui/core/InputAdornment';
import Fab from '@material-ui/core/Fab';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Subheader from '@material-ui/core/ListSubheader';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';

import AccessTimeIcon from '@material-ui/icons/AccessTime';
import AddIcon from '@material-ui/icons/Add';
import AddBoxIcon from '@material-ui/icons/AddBox';
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
import FlipToBackIcon from '@material-ui/icons/FlipToBack';
import GridOnIcon from '@material-ui/icons/GridOn';
import IndeterminateCheckBoxIcon from '@material-ui/icons/IndeterminateCheckBox';
import MessageIcon from '@material-ui/icons/Message';
import RecentActorsIcon from '@material-ui/icons/RecentActors';
import RecordVoiceOverIcon from '@material-ui/icons/RecordVoiceOver';
import SettingsRemoteIcon from '@material-ui/icons/SettingsRemote';
import ViewListIcon from '@material-ui/icons/ViewList';

import Thumb from '-/components/feel/Thumb';
import {AppBar, IconButton, Loading} from '-/components/shared';
import CategoriesSelect from '-/components/feel/CategoriesSelect';
import DevicesSelect from '-/components/feel/DevicesSelect';
import {groupFeels} from '-/components/feel/utils';

import {copyFeel, getFeels, removeFeel, sendFeel, sendMessage, subscribe, unsubscribe} from '-/graphql/feel';
import {getPushFriends} from '-/graphql/user';
import client from '-/graphql/client';

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
        overflowY: 'auto'
    },
    grid: {
        margin: '0px !important'
    },
    fab: {
        position: 'fixed',
        bottom: theme.spacing(2),
        right: theme.spacing(2),
        zIndex: 10000000
    },
    toolbar: {
        backgroundColor: '#222'
    },
    grow: {
        flexGrow: 1
    },
    selectionCount: {
        flex: 1,
        paddingRight: 15,
        textAlign: 'left'
    },
    listItem: {

    },
    listIcon: {
        minWidth: 50,
        marginRight: 10
    },
    listitemicon: {
        width: 35,
        minWidth: 35
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

class FeelsList extends Component {
    constructor(props) {
        super(props);

        const displayMode = localStorage.getItem('displayMode');

        this.state = {
            activeFeel: undefined,
            anchorEl: undefined,
            categories: [],
            deviceEl: undefined,
            dialogEl: undefined,
            displayMode: displayMode || 'grid',
            duration: 1000,
            message: '',
            messageDuration: 50,
            notification: '',
            notificationEl: undefined,
            messageEl: undefined,
            selectedDevices: [],
            selectedDeviceGroups: [],
            selectedFeels: [],
            selectedFriends: []
        };
    }

    onAddClick = () => {
        const {history} = this.props;

        history.push('/canvas');
    };

    onCategoriesChange = categories => {
        this.setState({categories});
    };

    onCarouselClick = () => {
        const {history} = this.props;

        history.push('/feelgroups');
    };

    onCopyClick = () => {
        const {showSnackbar} = this.props;
        const _id = get(this.state, 'activeFeel._id');

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

    onDeviceCheck = selections => {
        this.setState({selectedDevices: selections});
    };

    onDeviceClick = e => {
        this.setState({deviceEl: e.target});
    };

    onDeviceGroupCheck = selections => {
        this.setState({selectedDeviceGroups: selections});
    };

    onDialogClose = () => {
        this.setState({
            activeFeel: undefined,
            deviceEl: undefined,
            dialogEl: undefined,
            messageEl: undefined,
            notificationEl: undefined
        });
    };

    onDialogSubmit = async() => {
        const {showSnackbar} = this.props;
        const _id = get(this.state, 'activeFeel._id');

        client.mutate({
            mutation: removeFeel,
            variables: {_id}
        }).then(() => {
            showSnackbar('Feel was successfully removed');
        });

        this.onDialogClose();
    };

    onDisplayModeClick = displayMode => {
        this.setState({displayMode});
    };

    onDurationChange = e => {
        this.setState({duration: e.target.value});
    };

    onEditClick = () => {
        const {history} = this.props;
        const _id = get(this.state, 'activeFeel._id');

        history.push(`/canvas/${_id}`);
    };

    onFeelSelect = _id => {
        const {selectedFeels} = this.state;
        const selectedIndex = selectedFeels.findIndex(selectedFeel => selectedFeel === _id);

        if (selectedIndex !== -1) {
            selectedFeels.splice(selectedIndex, 1);
        } else {
            selectedFeels.push(_id);
        }

        this.setState({selectedFeels});
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

    onIconClick = (activeFeel, fn, e) => {
        e.persist();

        this.setState({activeFeel}, () => {
            this[fn](e);
        });
    };

    onMessageClick = e => {
        this.setState({
            messageEl: e.target,
            selectedDevices: [],
            selectedDeviceGroups: []
        });
    };

    onMessageChange = e => {
        const message = get(e, 'target.value');

        this.setState({message});
    };

    onMessageDurationChange = e => {
        this.setState({messageDuration: e.target.value});
    };

    onMenuOpen = (anchorEl, activeFeel) => {
        this.setState({activeFeel, anchorEl});
    };

    onMenuClose = () => {
        this.setState({
            anchorEl: undefined
        });
    };

    onNotificationChange = e => {
        const notification = get(e, 'target.value');

        this.setState({notification});
    };

    onNotifyClick = e => {
        this.onMenuClose();
        this.setState({notificationEl: e.target});
    };

    onNotifyFriendsClick = () => {
        const {notification, selectedFriends} = this.state;
        const _id = get(this.state, 'activeFeel._id');

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

    onPushClick = e => {
        this.onMenuClose();
        this.setState({deviceEl: e.target});
    };

    onPushDevicesClick = () => {
        const {selectedDevices, selectedDeviceGroups} = this.state;
        const _id = get(this.state, 'activeFeel._id');

        client.mutate({
            mutation: sendFeel,
            variables: {
                _id,
                data: {
                    devices: selectedDevices,
                    deviceGroups: selectedDeviceGroups
                }
            }
        });

        this.onDialogClose();
    };

    onRemoveClick = e => {
        this.onMenuClose();
        this.setState({dialogEl: e.target});
    };

    onSendMessageClick = async() => {
        const {message, messageDuration, selectedDevices, selectedDeviceGroups} = this.state;

        await client.mutate({
            mutation: sendMessage,
            variables: {
                data: {
                    devices: selectedDevices,
                    deviceGroups: selectedDeviceGroups,
                    duration: Number(messageDuration),
                    message
                }
            }
        });

        this.setState({
            selectedDevices: [],
            selectedDeviceGroups: []
        });
        this.onDialogClose();
    };

    onSubscribeClick = () => {
        const {showSnackbar} = this.props;
        const _id = get(this.state, 'activeFeel._id');

        client.mutate({
            mutation: subscribe,
            variables: {_id}
        }).then(() => {
            showSnackbar('Added to Favs!');
        });

        this.onMenuClose();
    };

    onTap = _id => {
        client.mutate({
            mutation: sendFeel,
            variables: {_id}
        });
    };

    onUnsubscribeClick = () => {
        const {showSnackbar} = this.props;
        const _id = get(this.state, 'activeFeel._id');

        client.mutate({
            mutation: unsubscribe,
            variables: {_id}
        }).then(() => {
            showSnackbar('Removed from Favs');
        });

        this.onMenuClose();
    };

    render() {
        const {
            activeFeel,
            anchorEl,
            categories: filter = [],
            deviceEl,
            dialogEl,
            displayMode,
            message,
            messageDuration = 50,
            messageEl,
            notification,
            notificationEl,
            selectedFriends = []
        } = this.state;
        const {classes, Snackbar} = this.props;
        const feels = get(this.props, 'data_feels.feels', []);
        const loading = get(this.props, 'data_feels.loading');
        const friends = get(this.props, 'data_friends.pushFriends') || [];
        const groupedFeels = groupFeels(feels, {filter});
        const durationAdornment = (
            <InputAdornment position="start">
                <AccessTimeIcon />
            </InputAdornment>
        );
        const extraContent = (
            <Toolbar position="fixed" className={classes.toolbar} variant="dense" disableGutters={false}>
                <IconButton
                    Icon={GridOnIcon}
                    onClick={this.onDisplayModeClick.bind(this, 'grid')}
                    edge="start"
                    color={displayMode === 'grid' ? 'secondary' : 'action'}
                    title="View as grid" />
                <IconButton
                    Icon={ViewListIcon}
                    onClick={this.onDisplayModeClick.bind(this, 'list')}
                    edge="start"
                    color={displayMode === 'list' ? 'secondary' : 'action'}
                    title="View as list" />
                <CategoriesSelect categorySelectionHandler={this.onCategoriesChange} />
                <div className={classes.grow} />
                <IconButton Icon={MessageIcon} onClick={this.onMessageClick} title="Send text message" />
                <IconButton Icon={RecentActorsIcon} onClick={this.onCarouselClick} className={classes.carousel} edge="end" title="View Feel Groups" />
            </Toolbar>
        );
        const menu = [];

        if (activeFeel) {
            const {isOwner, isSubscribed, isSubscriptionOwner, name} = activeFeel;
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
            const nameLabel = (
                <MenuItem key="feel-name">
                    <Typography variant="h6">
                        {name}
                    </Typography>
                </MenuItem>
            );
            const actions = [edit, remove, push, notify];

            menu.push(nameLabel);

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
        }

        return (
            <div className={classes.container}>
                <AppBar title="My Feels" extraContent={extraContent} />

                <Dialog open={Boolean(messageEl)} onClose={this.onDialogClose} keepMounted={false}>
                    <DialogTitle>Send Message to Devices</DialogTitle>
                    <DialogContent>
                        <FormControl component="fieldset" className={classes.formControl}>
                            <TextField
                                autoFocus={true}
                                label="Message"
                                fullWidth={true}
                                onChange={this.onMessageChange}
                                value={message}
                                name="message"
                                style={{marginBottom: 10}}
                                variant="outlined" />
                            <TextField
                                style={{marginBottom: 10}}
                                name="messageDuration"
                                value={messageDuration || 50}
                                onChange={this.onMessageDurationChange}
                                type="number"
                                fullWidth={true}
                                variant="outlined"
                                label="Duration"
                                InputProps={{
                                    min: 1,
                                    max: 100000,
                                    size: 'small',
                                    startAdornment: durationAdornment
                                }} />
                            <DevicesSelect messageCapable={true} onDeviceCheck={this.onDeviceCheck} onDeviceGroupCheck={this.onDeviceGroupCheck} />
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onSendMessageClick} color="secondary" variant="contained" size="small" autoFocus>
                            Send
                        </Button>
                    </DialogActions>
                </Dialog>
                {activeFeel &&
                    <Fragment>
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
                                <Button onClick={this.onDialogClose} color="default" variant="contained" size="small">
                                    Cancel
                                </Button>
                                <Button onClick={this.onDialogSubmit} color="secondary" variant="contained" size="small" autoFocus>
                                    Agree
                                </Button>
                            </DialogActions>
                        </Dialog>

                        <Dialog open={Boolean(deviceEl)} onClose={this.onDialogClose} keepMounted={false}>
                            <DialogTitle>Send to Devices</DialogTitle>
                            <DialogContent>
                                <DevicesSelect onDeviceCheck={this.onDeviceCheck} onDeviceGroupCheck={this.onDeviceGroupCheck} />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={this.onDialogClose} color="default" variant="contained" size="small">
                                    Cancel
                                </Button>
                                <Button onClick={this.onPushDevicesClick} color="secondary" variant="contained" size="small" autoFocus>
                                    Send
                                </Button>
                            </DialogActions>
                        </Dialog>

                        <Dialog open={Boolean(notificationEl)} onClose={this.onDialogClose} keepMounted={false}>
                            <DialogTitle>Send to Friends</DialogTitle>
                            <DialogContent>
                                <FormControl component="fieldset" className={classes.formControl}>
                                    <FormGroup>
                                        {friends.map(friend => {
                                            const {_id: userId, email, name} = friend;
                                            const isChecked = selectedFriends.includes(userId);

                                            return (
                                                <FormControlLabel
                                                    key={userId}
                                                    control={
                                                        <Checkbox checked={isChecked} onChange={this.onFriendCheck} name={userId} />
                                                    }
                                                    label={name || email} />
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
                                <Button onClick={this.onDialogClose} color="default" variant="contained" size="small">
                                    Cancel
                                </Button>
                                <Button onClick={this.onNotifyFriendsClick} color="secondary" variant="contained" size="small" autoFocus>
                                    Send
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </Fragment>
                }
                <div className={classes.root} style={{marginTop: 103}}>
                    {loading && <Loading message="Loading Your Feels..." />}
                    {!loading &&
                        <Fragment>
                            {displayMode === 'list' &&
                                <List component="div" dense={true} style={{padding: 0}}>
                                    {groupedFeels.map(group => {
                                        const {_id, name, feels = []} = group;

                                        return (
                                            <Fragment key={_id}>
                                                <ListSubheader className={classes.subheader}>{name}</ListSubheader>

                                                {feels.map((feel, idx) => {
                                                    const {_id, isOwner, isSubscribed, isSubscriptionOwner} = feel;
                                                    const icons = [];
                                                    const editIcon = (
                                                        <ListItemIcon className={classes.listitemicon} key="editIcon" onClick={this.onIconClick.bind(this, feel, 'onEditClick')}>
                                                            <IconButton Icon={EditIcon} title="Edit Feel" />
                                                        </ListItemIcon>
                                                    );
                                                    const removeIcon = (
                                                        <ListItemIcon className={classes.listitemicon} key="removeIcon" onClick={this.onIconClick.bind(this, feel, 'onRemoveClick')}>
                                                            <IconButton Icon={CloseIcon} title="Remove Feel" />
                                                        </ListItemIcon>
                                                    );
                                                    const pushIcon = (
                                                        <ListItemIcon className={classes.listitemicon} key="pushIcon" onClick={this.onIconClick.bind(this, feel, 'onPushClick')}>
                                                            <IconButton Icon={SettingsRemoteIcon} title="Send to Devices" />
                                                        </ListItemIcon>
                                                    );
                                                    const notifyIcon = (
                                                        <ListItemIcon className={classes.listitemicon} key="notifyIcon" onClick={this.onIconClick.bind(this, feel, 'onNotifyClick')}>
                                                            <IconButton Icon={RecordVoiceOverIcon} title="Send to Friends" />
                                                        </ListItemIcon>
                                                    );
                                                    const saveToFavsIcon = (
                                                        <ListItemIcon className={classes.listitemicon} key="subscribeIcon" onClick={this.onIconClick.bind(this, feel, 'onSubscribeClick')}>
                                                            <IconButton Icon={AddBoxIcon} title="Save to Favs" />
                                                        </ListItemIcon>
                                                    );
                                                    const removeFromFavsIcon = (
                                                        <ListItemIcon className={classes.listitemicon} key="unsubscribeIcon" onClick={this.onIconClick.bind(this, feel, 'onUnsubscribeClick')}>
                                                            <IconButton Icon={IndeterminateCheckBoxIcon} title="Remove from Favs" />
                                                        </ListItemIcon>
                                                    );
                                                    const copyFeelIcon = (
                                                        <ListItemIcon className={classes.listitemicon} key="copyIcon" onClick={this.onIconClick.bind(this, feel._id, 'onCopyClick')}>
                                                            <IconButton Icon={FlipToBackIcon} title="Copy to My Feels" />
                                                        </ListItemIcon>
                                                    );

                                                    if (isOwner) {
                                                        icons.push(...[editIcon, removeIcon, pushIcon, notifyIcon]);
                                                    } else {
                                                        if (!isSubscribed) {
                                                            icons.push(saveToFavsIcon);
                                                        } else if (isSubscriptionOwner) {
                                                            icons.push(removeFromFavsIcon);
                                                        }

                                                        icons.push(...[copyFeelIcon, pushIcon, notifyIcon]);
                                                    }

                                                    const content = (
                                                        <ListItem key={_id} component="div" className={classes.listItem}>
                                                            <ListItemIcon className={classes.listIcon}>
                                                                <Thumb
                                                                    displayMode={displayMode}
                                                                    feel={feel}
                                                                    tapHandler={this.onTap} />
                                                            </ListItemIcon>
                                                            <ListItemText primary={feel.name} style={{flexGrow: 1}} />
                                                            {icons}
                                                        </ListItem>
                                                    );

                                                    return (
                                                        <Fragment key={_id}>
                                                            {content}
                                                            {idx !== feels.length - 1 && <Divider />}
                                                        </Fragment>
                                                    );
                                                })}
                                            </Fragment>
                                        );
                                    })}
                                </List>
                            }
                            {displayMode === 'grid' &&
                                <Fragment>
                                    {groupedFeels.map(group => {
                                        const {_id, name, feels = []} = group;

                                        return (
                                            <Fragment key={_id}>
                                                <Subheader component="div" className={classes.subheader}>{name}</Subheader>
                                                <GridList cols={3} cellHeight={64} className={classes.grid}>
                                                    {feels.map(feel => {
                                                        const {_id} = feel;
                                                        return (
                                                            <Thumb
                                                                key={_id}
                                                                displayMode={displayMode}
                                                                feel={feel}
                                                                menuOpenHandler={this.onMenuOpen}
                                                                tapHandler={this.onTap} />
                                                        );
                                                    })}
                                                </GridList>
                                            </Fragment>

                                        );
                                    })}
                                </Fragment>
                            }
                        </Fragment>
                    }
                </div>
                {Snackbar}
                <Fab className={classes.fab} color="secondary" onClick={this.onAddClick}>
                    <AddIcon />
                </Fab>
            </div>
        );
    }
}

export default withRouter(
    compose(

        graphql(getFeels, {
            name: 'data_feels',
            options: {
                notifyOnNetworkStatusChange: true
            }
        }),
        graphql(getPushFriends, {
            name: 'data_friends',
            options: {
                notifyOnNetworkStatusChange: true
            }
        }),
        withStyles(styles)
    )(FeelsList)
);
