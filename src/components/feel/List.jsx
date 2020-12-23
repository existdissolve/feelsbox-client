import {Component, Fragment} from 'react';
import {withStyles} from '@material-ui/core/styles';
import {graphql} from 'react-apollo';
import {compose} from 'recompose';
import {withRouter} from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import GridList from '@material-ui/core/GridList';
import Subheader from '@material-ui/core/ListSubheader';
import Fab from '@material-ui/core/Fab';
import ListAltIcon from '@material-ui/icons/ListAlt';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Toolbar from '@material-ui/core/Toolbar';
import RecentActorsIcon from '@material-ui/icons/RecentActors';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import TextField from '@material-ui/core/TextField';
import {Typography} from '@material-ui/core';
import VideoLabelIcon from '@material-ui/icons/VideoLabel';
import {get} from 'lodash';

import AppBar from '-/components/AppBar';
import SimpleThumb from '-/components/feel/SimpleThumb';
import Thumb from '-/components/feel/Thumb';
import {getMyCategories} from '-/graphql/category';
import {getDevices} from '-/graphql/device';
import {getFeels, sendCarousel} from '-/graphql/feel';
import {getPushFriends} from '-/graphql/user';
import client from '-/graphql/client';

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.background.paper
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
    }
});

class FeelsList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            carouselMode: false,
            categories: [],
            deviceEl: undefined,
            duration: 1000,
            selectedDevices: [],
            selectedFeels: []
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

    onDurationChange = e => {
        console.log(e.target.value)
        this.setState({duration: e.target.value});
    };

    onDialogClose = () => {
        this.setState({deviceEl: undefined});
    };

    onDeviceClick = e => {
        this.setState({deviceEl: e.target});
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

    render() {
        const {carouselMode, categories: filter = [], deviceEl, duration = 1000, selectedDevices = [], selectedFeels = []} = this.state;
        const {classes, showSnackbar, Snackbar} = this.props;
        const feels = get(this.props, 'data_feels.feels', []);
        const myCategories = get(this.props, 'data_categories.myCategories') || [];
        const devices = get(this.props, 'data_devices.devices') || [];
        const friends = get(this.props, 'data_friends.pushFriends') || [];
        const groupedFeels = feels.filter(feel => feel.active).reduce((groups, feel) => {
            const {categories = [], isSubscribed} = feel;

            if (isSubscribed || !categories.length) {
                if (filter.length) {
                    return groups;
                }

                const categoryId = isSubscribed ? '__' : 'uncategorized';
                const categoryName = isSubscribed ? 'Followed Feels' : 'Uncategorized';
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

        return (
            <div>
                <AppBar title="My Feels" />
                <Toolbar className={classes.toolbar} variant="dense" disableGutters={false}>
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
                    <IconButton onClick={this.onCarouselClick} className={classes.carousel} edge="end">
                        <RecentActorsIcon />
                    </IconButton>
                </Toolbar>
                {carouselMode &&
                    <Fragment>
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
                            <Button onClick={this.onSendCarouselClick} color="primary" autoFocus>
                                Send
                            </Button>
                        </Toolbar>
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
                                <Button onClick={this.onDialogClose} color="primary" autoFocus>
                                    Select
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </Fragment>
                }
                <div className={classes.root}>
                    {groupedFeels.map(group => {
                        const {_id, name, feels = []} = group;

                        return (
                            <Fragment key={_id}>
                                <Subheader component="div">{name}</Subheader>
                                <GridList cols={3} cellHeight={64} className={classes.grid}>
                                    {feels.map(feel => {
                                        const {_id} = feel;

                                        if (carouselMode) {
                                            const isSelected = selectedFeels.some(selectedFeel => selectedFeel === _id);

                                            return <SimpleThumb key={_id} feel={feel} selectionHandler={this.onFeelSelect} isSelected={isSelected} />;
                                        } else {
                                            return <Thumb devices={devices} friends={friends} feel={feel} key={_id} showSnackbar={showSnackbar} />;
                                        }
                                    })}
                                </GridList>
                            </Fragment>

                        );
                    })}
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
