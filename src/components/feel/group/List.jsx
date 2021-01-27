import {Component, Fragment} from 'react';
import {withStyles} from '@material-ui/core/styles';
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
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import GridList from '@material-ui/core/GridList';
import Fab from '@material-ui/core/Fab';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Subheader from '@material-ui/core/ListSubheader';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
import SettingsRemoteIcon from '@material-ui/icons/SettingsRemote';

import AppBar from '-/components/AppBar';
import SimpleThumb from '-/components/feel/SimpleThumb';
import Loading from '-/components/Loading';

import {getDevices} from '-/graphql/device';
import {getFeelGroups, removeFeelGroup, sendFeelGroup} from '-/graphql/feelGroup';
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
        backgroundColor: '#222',
        minHeight: 'auto'
    },
    smallicon: {
        width: '.75em',
        height: '.75em'
    },
    listitemicon: {
        transform: 'translateY(25%)',
        minWidth: 'inherit',
        marginLeft: 10
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

class FeelGroupsList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeGroup: undefined,
            anchorEl: undefined,
            deviceEl: undefined,
            dialogEl: undefined,
            selectedDevices: []
        };
    }

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
            activeGroup: undefined,
            deviceEl: undefined,
            dialogEl: undefined
        });
    };

    onAddClick = () => {
        const {history} = this.props;

        history.push('/feelgroups/new');
    };

    onEditClick = () => {
        const {history} = this.props;
        const _id = get(this.state, 'activeGroup._id');

        history.push(`/feelgroups/${_id}`);
    };

    onIconClick = (activeGroup, fn, e) => {
        e.persist();

        this.setState({activeGroup}, () => {
            this[fn](e);
        });
    };

    onMenuClose = () => {
        this.setState({
            anchorEl: undefined
        });
    };

    onPushClick = e => {
        this.onMenuClose();
        this.setState({deviceEl: e.target});
    };

    onPushDevicesClick = () => {
        const {selectedDevices} = this.state;
        const _id = get(this.state, 'activeGroup._id');

        client.mutate({
            mutation: sendFeelGroup,
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

    onRemoveSubmit = async() => {
        const {showSnackbar} = this.props;
        const _id = get(this.state, 'activeGroup._id');

        client.mutate({
            mutation: removeFeelGroup,
            variables: {_id}
        }).then(() => {
            showSnackbar('Feels Group was successfully removed');
        });

        this.onDialogClose();
    };

    render() {
        const {activeGroup, deviceEl, dialogEl, selectedDevices = []} = this.state;
        const {classes, Snackbar} = this.props;
        const feelGroups = get(this.props, 'data_feelGroups.feelGroups', []);
        const loading = get(this.props, 'data_feelGroups.loading');
        const devices = get(this.props, 'data_devices.devices') || [];

        return (
            <div className={classes.container}>
                <AppBar title="My Feels Groups" />
                {activeGroup &&
                    <Fragment>
                        <Dialog open={Boolean(dialogEl)} onClose={this.onDialogClose} keepMounted={false}>
                            <DialogTitle>Remove Feels Group?</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    Are you sure you want to remove this Feels Group from your collection permanently?
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={this.onDialogClose} color="default" variant="contained" size="small">
                                    Cancel
                                </Button>
                                <Button onClick={this.onRemoveSubmit} color="secondary" variant="contained" size="small" autoFocus>
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
                    </Fragment>
                }
                <div className={classes.root} style={{marginTop: 56}}>
                    {loading && <Loading message="Loading Your Feels Groups..." />}
                    {!loading &&
                        <List component="div" dense={true} style={{padding: 0}}>
                            {feelGroups.map((group, idx) => {
                                const {_id, name, feels = []} = group;

                                return (
                                    <Fragment key={`${_id}_${idx}`}>
                                        <Subheader component="div" className={classes.subheader}>
                                            <List component="div" dense={true} style={{padding: 0, display: 'flex'}}>
                                                <ListItem style={{flexGrow: 1}}>{name}</ListItem>
                                                <ListItemIcon className={classes.listitemicon} onClick={this.onIconClick.bind(this, group, 'onPushClick')}>
                                                    <SettingsRemoteIcon edge="end" className={classes.smallicon} />
                                                </ListItemIcon>
                                                <ListItemIcon className={classes.listitemicon} onClick={this.onIconClick.bind(this, group, 'onEditClick')}>
                                                    <EditIcon edge="end" className={classes.smallicon} />
                                                </ListItemIcon>
                                                <ListItemIcon className={classes.listitemicon} onClick={this.onIconClick.bind(this, group, 'onRemoveClick')}>
                                                    <CloseIcon edge="end" className={classes.smallicon} />
                                                </ListItemIcon>
                                            </List>
                                        </Subheader>
                                        <GridList cols={3} cellHeight={64} className={classes.grid}>
                                            {feels.map((feel, xdx) => {
                                                const {_id} = feel;

                                                return (
                                                    <SimpleThumb
                                                        key={`${_id}_${xdx}`}
                                                        displayMode="grid"
                                                        feel={feel} />
                                                );
                                            })}
                                        </GridList>
                                    </Fragment>
                                );
                            })}
                        </List>
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
        graphql(getFeelGroups, {
            name: 'data_feelGroups',
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
        withStyles(styles)
    )(FeelGroupsList)
);
