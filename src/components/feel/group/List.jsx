import {Component, Fragment} from 'react';
import {graphql} from 'react-apollo';
import {compose} from 'recompose';
import {withRouter} from 'react-router-dom';
import {get} from 'lodash';
import {withStyles} from '@material-ui/core/styles';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Fab,
    GridList,
    List,
    ListItem,
    ListItemIcon,
    ListSubheader
} from '@material-ui/core';
import {
    Add as AddIcon,
    Close as CloseIcon,
    Edit as EditIcon,
    SettingsRemote as SettingsRemoteIcon
} from '@material-ui/icons';

import {AppBar, IconButton, Loading} from '-/components/shared';
import SimpleThumb from '-/components/feel/SimpleThumb';
import DevicesSelect from '-/components/feel/DevicesSelect';

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
        top: -12,
        '& .MuiSvgIcon-root': {
            fontSize: '1.2rem'
        }
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
            selectedDevices: [],
            selectedDeviceGroups: []
        };
    }

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
        const {selectedDevices, selectedDeviceGroups} = this.state;
        const _id = get(this.state, 'activeGroup._id');

        client.mutate({
            mutation: sendFeelGroup,
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
        const {activeGroup, deviceEl, dialogEl} = this.state;
        const {classes, Snackbar} = this.props;
        const feelGroups = get(this.props, 'data_feelGroups.feelGroups', []);
        const loading = get(this.props, 'data_feelGroups.loading');

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
                                        <ListSubheader component="div" className={classes.subheader}>
                                            <List component="div" dense={true} style={{padding: 0, display: 'flex'}}>
                                                <ListItem style={{flexGrow: 1}}>{name}</ListItem>
                                                <ListItemIcon className={classes.listitemicon} onClick={this.onIconClick.bind(this, group, 'onPushClick')}>
                                                    <IconButton Icon={SettingsRemoteIcon} className={classes.smallicon} title="Send to devices" />
                                                </ListItemIcon>
                                                <ListItemIcon className={classes.listitemicon} onClick={this.onIconClick.bind(this, group, 'onEditClick')}>
                                                    <IconButton Icon={EditIcon} className={classes.smallicon} title="Edit Feels Group" />
                                                </ListItemIcon>
                                                <ListItemIcon className={classes.listitemicon} onClick={this.onIconClick.bind(this, group, 'onRemoveClick')}>
                                                    <IconButton Icon={CloseIcon} className={classes.smallicon} edge="end" title="Remove Feels Group" />
                                                </ListItemIcon>
                                            </List>
                                        </ListSubheader>
                                        <GridList cols={3} cellHeight={64} className={classes.grid}>
                                            {feels.map((feel, xdx) => {
                                                const {_id} = feel;

                                                return (
                                                    <SimpleThumb
                                                        key={`${_id}_${xdx}`}
                                                        displayMode="grid"
                                                        feel={feel}
                                                        selectionHandler={() => {}} />
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
        withStyles(styles)
    )(FeelGroupsList)
);
