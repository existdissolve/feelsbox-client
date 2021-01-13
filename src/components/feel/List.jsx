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
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Fab from '@material-ui/core/Fab';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
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
import ListAltIcon from '@material-ui/icons/ListAlt';
import MessageIcon from '@material-ui/icons/Message';
import RecentActorsIcon from '@material-ui/icons/RecentActors';
import RecordVoiceOverIcon from '@material-ui/icons/RecordVoiceOver';
import SettingsRemoteIcon from '@material-ui/icons/SettingsRemote';
import VideoLabelIcon from '@material-ui/icons/VideoLabel';
import ViewListIcon from '@material-ui/icons/ViewList';

import AppBar from '-/components/AppBar';
import SimpleThumb from '-/components/feel/SimpleThumb';
import Thumb from '-/components/feel/Thumb';
import Loading from '-/components/Loading';

import {getMyCategories} from '-/graphql/category';
import {getDevices} from '-/graphql/device';
import {copyFeel, getFeels, removeFeel, sendCarousel, sendFeel, sendMessage, subscribe, unsubscribe} from '-/graphql/feel';
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
        overflowY: 'scroll'
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
    carousel: {

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

        this.state = {
            activeFeel: undefined,
            anchorEl: undefined,
            carouselMode: false,
            categories: [],
            deviceEl: undefined,
            dialogEl: undefined,
            displayMode: 'grid',
            duration: 1000,
            message: '',
            notification: '',
            notificationEl: undefined,
            messageEl: undefined,
            selectedDevices: [],
            selectedFeels: [],
            selectedFriends: []
        };
    }

    onAddClick = () => {
        const {history} = this.props;

        history.push('/canvas');
    };

    onCategoriesChanges = e => {
        const categories = get(e, 'target.value');

        this.setState({categories});
    };

    onCarouselClick = () => {
        const {carouselMode} = this.state;

        this.setState({
            carouselMode: !carouselMode,
            duration: 1000,
            selectedDevices: [],
            selectedFeels: []
        });
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

    onDeviceClick = e => {
        this.setState({deviceEl: e.target});
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
            selectedDevices: []
        });
    };

    onMessageChange = e => {
        const message = get(e, 'target.value');

        this.setState({message});
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
        const {selectedDevices} = this.state;
        const _id = get(this.state, 'activeFeel._id');

        client.mutate({
            mutation: sendFeel,
            variables: {
                _id,
                data: {devices: selectedDevices}
            }
        });

        this.onDialogClose();
    };

    onRemoveClick = e => {
        this.onMenuClose();
        this.setState({dialogEl: e.target});
    };

    onSendCarouselClick = async() => {
        const {duration, selectedDevices, selectedFeels} = this.state;

        await client.mutate({
            mutation: sendCarousel,
            variables: {
                feels: selectedFeels,
                data: {
                    devices: selectedDevices,
                    duration: Number(duration)
                }
            }
        });

        this.onCarouselClick();
    };

    onSendMessageClick = async() => {
        const {message, selectedDevices} = this.state;

        await client.mutate({
            mutation: sendMessage,
            variables: {
                data: {
                    devices: selectedDevices,
                    message
                }
            }
        });

        this.setState({selectedDevices: []});
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
            carouselMode,
            categories: filter = [],
            deviceEl,
            dialogEl,
            displayMode,
            duration = 1000,
            message,
            messageEl,
            notification,
            notificationEl,
            selectedDevices = [],
            selectedFeels = [],
            selectedFriends = []
        } = this.state;
        const {classes, Snackbar} = this.props;
        const feels = get(this.props, 'data_feels.feels', []);
        const loading = get(this.props, 'data_feels.loading');
        const myCategories = get(this.props, 'data_categories.myCategories') || [];
        const devices = get(this.props, 'data_devices.devices') || [];
        const friends = get(this.props, 'data_friends.pushFriends') || [];
        const messageCapableDevices = devices.slice().filter(device => get(device, 'capabilities.messages'));
        const groupedFeels = feels.filter(feel => feel.active).reduce((groups, feel) => {
            const {categories = []} = feel;

            if (!categories.length) {
                if (filter.length) {
                    return groups;
                }

                const categoryId = 'uncategorized';
                const categoryName = 'Uncategorized';
                const group = groups.find(item => item._id === categoryId);

                if (!group) {
                    groups.push({
                        _id: categoryId,
                        name: categoryName,
                        feels: [feel]
                    });
                } else {
                    group.feels.push(feel);
                }
            } else {
                categories.forEach(category => {
                    const {_id, name} = category;

                    if (filter.length && !filter.includes(_id)) {
                        return false;
                    }

                    const group = groups.find(item => item._id === _id);

                    if (!group) {
                        groups.push({
                            _id,
                            name,
                            feels: [feel]
                        });
                    } else {
                        group.feels.push(feel);
                    }
                });
            }

            return groups.sort((prev, next) => {
                const {name: pn} = prev;
                const {name: nn} = next;

                return pn < nn ? -1 : pn > nn ? 1 : 0;
            });
        }, []);
        const adornment = (
            <InputAdornment position="start">
                <ListAltIcon />
            </InputAdornment>
        );
        const durationAdornment = (
            <InputAdornment position="start">
                <AccessTimeIcon />
            </InputAdornment>
        );
        const extraContent = (
            <Fragment>
                <Toolbar position="fixed" className={classes.toolbar} variant="dense" disableGutters={false}>
                    <IconButton onClick={this.onDisplayModeClick.bind(this, 'grid')} edge="start" color={displayMode === 'grid' ? 'secondary' : 'default'}>
                        <GridOnIcon />
                    </IconButton>
                    <IconButton onClick={this.onDisplayModeClick.bind(this, 'list')} edge="start" color={displayMode === 'list' ? 'secondary' : 'default'}>
                        <ViewListIcon />
                    </IconButton>
                    <Select
                        value={filter}
                        onChange={this.onCategoriesChanges}
                        startAdornment={adornment}
                        multiple={true}
                        autoWidth={false}
                        style={{width: '50%'}}
                        margin="dense"
                        size="small"
                        variant="outlined">
                        {myCategories.map(category => {
                            const {_id, name} = category;

                            return (
                                <MenuItem key={_id} value={_id}>{name}</MenuItem>
                            );
                        })}
                    </Select>
                    <div className={classes.grow} />
                    {messageCapableDevices.length > 0 &&
                        <IconButton onClick={this.onMessageClick}>
                            <MessageIcon />
                        </IconButton>
                    }
                    <IconButton onClick={this.onCarouselClick} className={classes.carousel} edge="end">
                        <RecentActorsIcon />
                    </IconButton>
                </Toolbar>
                {carouselMode &&
                    <Toolbar className={classes.toolbar} variant="dense" disableGutters={false}>
                        <Typography variant="button" className={classes.selectionCount}>{selectedFeels.length} {selectedFeels.length === 1 ? 'Selection' : 'Selections'}</Typography>
                        <TextField
                            style={{flex: 1}}
                            name="duration"
                            margin="dense"
                            value={duration || 1000}
                            onChange={this.onDurationChange}
                            type="number"
                            size="small"
                            variant="outlined"
                            InputProps={{
                                min: 1,
                                max: 100000,
                                size: 'small',
                                startAdornment: durationAdornment
                            }} />
                        <IconButton onClick={this.onDeviceClick}>
                            <VideoLabelIcon />
                        </IconButton>
                        <Button onClick={this.onSendCarouselClick} color="secondary" variant="contained" autoFocus edge="end" size="small">
                            Send
                        </Button>
                    </Toolbar>
                }
            </Fragment>
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

                {carouselMode &&
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
                            <Button onClick={this.onDialogClose} color="secondary" variant="contained" size="small" autoFocus>
                                Select
                            </Button>
                        </DialogActions>
                    </Dialog>
                }
                {messageCapableDevices.length > 0 &&
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
                                    variant="outlined"
                                    style={{marginBottom: 10}} />
                                <FormGroup>
                                    {messageCapableDevices.map(device => {
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
                            <Button onClick={this.onSendMessageClick} color="secondary" variant="contained" size="small" autoFocus>
                                Send
                            </Button>
                        </DialogActions>
                    </Dialog>
                }
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
                <div className={classes.root} style={{marginTop: carouselMode ? 155 : 103}}>
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
                                                    let content;

                                                    if (carouselMode) {
                                                        const isSelected = selectedFeels.some(selectedFeel => selectedFeel === _id);

                                                        content = (
                                                            <ListItem key={_id} component="div" className={classes.listItem}>
                                                                <ListItemIcon className={classes.listIcon}>
                                                                    <SimpleThumb
                                                                        displayMode={displayMode}
                                                                        feel={feel}
                                                                        selectionHandler={this.onFeelSelect}
                                                                        isSelected={isSelected} />
                                                                </ListItemIcon>
                                                                <ListItemText primary={feel.name} style={{flexGrow: 1}} />
                                                            </ListItem>
                                                        );
                                                    } else {
                                                        const icons = [];
                                                        const editIcon = (
                                                            <ListItemIcon className={classes.listitemicon} key="editIcon" onClick={this.onIconClick.bind(this, feel, 'onEditClick')}>
                                                                <EditIcon />
                                                            </ListItemIcon>
                                                        );
                                                        const removeIcon = (
                                                            <ListItemIcon className={classes.listitemicon} key="removeIcon" onClick={this.onIconClick.bind(this, feel, 'onRemoveClick')}>
                                                                <CloseIcon />
                                                            </ListItemIcon>
                                                        );
                                                        const pushIcon = (
                                                            <ListItemIcon className={classes.listitemicon} key="pushIcon" onClick={this.onIconClick.bind(this, feel, 'onPushClick')}>
                                                                <SettingsRemoteIcon />
                                                            </ListItemIcon>
                                                        );
                                                        const notifyIcon = (
                                                            <ListItemIcon className={classes.listitemicon} key="notifyIcon" onClick={this.onIconClick.bind(this, feel, 'onNotifyClick')}>
                                                                <RecordVoiceOverIcon />
                                                            </ListItemIcon>
                                                        );
                                                        const saveToFavsIcon = (
                                                            <ListItemIcon className={classes.listitemicon} key="subscribeIcon" onClick={this.onIconClick.bind(this, feel, 'onSubscribeClick')}>
                                                                <AddBoxIcon />
                                                            </ListItemIcon>
                                                        );
                                                        const removeFromFavsIcon = (
                                                            <ListItemIcon className={classes.listitemicon} key="unsubscribeIcon" onClick={this.onIconClick.bind(this, feel, 'onUnsubscribeClick')}>
                                                                <IndeterminateCheckBoxIcon />
                                                            </ListItemIcon>
                                                        );
                                                        const copyFeelIcon = (
                                                            <ListItemIcon className={classes.listitemicon} key="copyIcon" onClick={this.onIconClick.bind(this, feel._id, 'onCopyClick')}>
                                                                <FlipToBackIcon />
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
                                                        content = (
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
                                                    }

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

                                                        if (carouselMode) {
                                                            const isSelected = selectedFeels.some(selectedFeel => selectedFeel === _id);

                                                            return (
                                                                <SimpleThumb
                                                                    key={_id}
                                                                    displayMode={displayMode}
                                                                    feel={feel}
                                                                    selectionHandler={this.onFeelSelect}
                                                                    isSelected={isSelected} />
                                                            );
                                                        } else {
                                                            return (
                                                                <Thumb
                                                                    key={_id}
                                                                    displayMode={displayMode}
                                                                    feel={feel}
                                                                    menuOpenHandler={this.onMenuOpen}
                                                                    tapHandler={this.onTap} />
                                                            );
                                                        }
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
                <Fab className={classes.fab} color="primary" onClick={this.onAddClick}>
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
        graphql(getMyCategories, {
            name: 'data_categories',
            options: {
                notifyOnNetworkStatusChange: true
            }
        }),
        graphql(getDevices, {
            name: 'data_devices',
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
