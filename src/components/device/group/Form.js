import {Component, Fragment} from 'react';
import {withStyles} from '@material-ui/core/styles';
import {graphql} from 'react-apollo';
import {compose} from 'recompose';
import {withRouter} from 'react-router-dom';
import {get} from 'lodash';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import GridList from '@material-ui/core/GridList';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Subheader from '@material-ui/core/ListSubheader';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';
import ClearAllIcon from '@material-ui/icons/ClearAll';
import SaveIcon from '@material-ui/icons/Save';
import VideoLabelIcon from '@material-ui/icons/VideoLabel';

import AppBar from '-/components/AppBar';
import Loading from '-/components/Loading';

import {getDevices} from '-/graphql/device';
import {addDeviceGroup, editDeviceGroup, getDeviceGroup, getDeviceGroups} from '-/graphql/deviceGroup';
import client from '-/graphql/client';

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        marginTop: 103,
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 103px)'
    },
    selections: {
        overflowY: 'auto',
        flex: '0 0 auto',
        maxHeight: 232
    },
    options: {
        flex: 1,
        overflowY: 'auto'
    },
    grid: {
        margin: '0px !important',
        padding: '10px 15px'
    },
    devicepill: {
        border: 'solid 1px',
        borderColor: theme.palette.secondary.main,
        backgroundColor: '#333',
        borderRadius: 3,
        padding: '5px 10px',
        lineHeight: 0,
        flex: '1 1 auto',
        marginBottom: 10,
        '&:nth-child(even)': {
            marginLeft: 10
        }
    },
    devicepillfilled: {
        border: 'solid 1px',
        borderColor: '#333',
        backgroundColor: theme.palette.primary.main,
        borderRadius: 3,
        padding: '5px 10px',
        lineHeight: 0,
        flex: '1 1 auto',
        marginBottom: 10,
        '&:nth-child(even)': {
            marginLeft: 10
        }
    },
    devicepilltext: {
        display: 'inline-block',
        position: 'relative',
        margin: '0 0 0 10px',
        top: '-7px'
    },
    toolbar: {
        backgroundColor: '#222'
    },
    selectionCount: {
        flex: 1,
        paddingRight: 15,
        textAlign: 'left'
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

class DeviceGroupForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeIdx: null,
            menuEl: null,
            name: 'New Device Group',
            open: false,
            selections: []
        };
    }

    componentDidUpdate(nextProps) {
        const nextLoading = get(nextProps, 'data_deviceGroup.loading');
        const currLoading = get(this.props, 'data_deviceGroup.loading');

        if (nextLoading !== currLoading) {
            const deviceGroup = get(this.props, 'data_deviceGroup.deviceGroup') || {};
            const {devices: selections = [], name = 'New Device Group'} = deviceGroup;

            this.setState({
                name,
                selections
            });
        }
    }

    onAddClick = e => {
        this.setState({
            menuEl: e.target
        });
    }

    onClearClick = () => {
        this.setState({selections: []});
    };

    onDataChange = e => {
        const target = get(e, 'target', {});
        const {name, value} = target;

        this.setState({
            [name]: value
        });
    };

    onDialogClose = () => {
        this.setState({open: false});
    };

    onEditClick = () => {
        this.setState({open: true});
    };

    onDeviceSelect = _id => {
        const items = get(this.props, 'data_devices.devices', []);
        const item = items.find(item => item._id === _id);

        if (item) {
            const {selections: existing} = this.state;
            const selections = existing.slice();

            selections.push(item);

            this.setState({selections});
        }
    };

    onDeviceTap = (idx, _id) => {
        const {activeIdx} = this.state;
        const items = get(this.props, 'data_devices.devices', []);
        const item = items.find(item => item._id === _id);

        if (item) {
            if (activeIdx === idx) {
                this.setState({activeIdx: null});
            } else {
                this.setState({activeIdx: idx});
            }
        }
    };

    onMenuClose = () => {
        this.setState({menuEl: null});
    };

    onRemoveClick = () => {
        const {activeIdx, selections: existing = []} = this.state;
        const selections = existing.slice();

        selections.splice(activeIdx, 1);

        this.setState({
            activeIdx: null,
            selections
        });
    };

    onSaveClick = async() => {
        const {history} = this.props;
        const _id = get(this.props, 'match.params._id');
        const {name, selections} = this.state;
        const data = {
            devices: selections.map(item => item._id),
            name
        };

        if (_id !== 'new') {
            await client.mutate({
                mutation: editDeviceGroup,
                variables: {_id, data}
            });
        } else {
            const result = await client.mutate({
                mutation: addDeviceGroup,
                refetchQueries: [{
                    fetchPolicy: 'network-only',
                    query: getDeviceGroups
                }],
                variables: {data}
            });
            const newId = get(result, 'data.addDeviceGroup._id');

            history.push(`/devicegroups/${newId}`);
        }

        this.onDialogClose();
    };

    onSelectDevice = _id => {
        const {selections: existing} = this.state;
        const selections = existing.slice();
        const items = get(this.props, 'data_devices.devices', []);
        const item = items.find(item => item._id === _id);

        if (item) {
            selections.push(item);

            this.setState({selections});
        }

        this.onMenuClose();
    };

    render() {
        const {activeIdx, menuEl, name, open, selections = []} = this.state;
        const {classes, Snackbar} = this.props;
        const allDevices = get(this.props, 'data_devices.devices', []);
        const devices = allDevices.filter(device => {
            const {_id} = device;
            const selectedIds = selections.map(item => item._id);

            return !selectedIds.includes(_id);
        });
        const loading = get(this.props, 'data_deviceGroup.loading');
        const isActive = activeIdx != null;
        const icons = (
            <IconButton onClick={this.onEditClick} disabled={!selections.length}>
                <SaveIcon />
            </IconButton>
        );
        const extraContent = (
            <Toolbar className={classes.toolbar} variant="dense" disableGutters={true}>
                <IconButton onClick={this.onClearClick} disabled={!selections.length}>
                    <ClearAllIcon />
                </IconButton>
                <IconButton onClick={this.onRemoveClick} disabled={!isActive}>
                    <CloseIcon />
                </IconButton>
                <IconButton onClick={this.onAddClick} disabled={isActive}>
                    <AddIcon />
                </IconButton>
            </Toolbar>
        );
        const DevicePill = props => {
            const {isSelected, name, onClick} = props;
            const cls = isSelected ? classes.devicepillfilled : classes.devicepill;

            return (
                <div className={cls} onClick={onClick}>
                    <VideoLabelIcon className={classes.devicepillicon} />
                    <span className={classes.devicepilltext}>{name}</span>
                </div>
            );
        };

        return (
            <div style={{overflow: 'hidden'}}>
                <AppBar title="Edit Device Group" extraContent={extraContent} iconRenderer={icons} />
                <div className={classes.root}>
                    {loading && <Loading message="Loading Your Device Group..." />}
                    {!loading &&
                        <Fragment>
                            <div className={classes.selections}>
                                <Subheader component="div" className={classes.subheader}>{name}</Subheader>
                                {selections.length === 0 &&
                                    <Typography component="p" gutterBottom={true} paragraph={true} style={{padding: 20}}>
                                        You haven&apos;t added any devices to the group...yet!
                                    </Typography>
                                }
                                <GridList cols={3} cellHeight={64} className={classes.grid}>
                                    {selections.map((device, idx) => {
                                        const {_id, name} = device;
                                        const isSelected = idx === activeIdx;

                                        return (
                                            <DevicePill key={_id} name={name} isSelected={isSelected} onClick={this.onDeviceTap.bind(this, idx, _id)} />
                                        );
                                    })}
                                </GridList>
                            </div>

                        </Fragment>
                    }
                </div>
                <Menu anchorEl={menuEl} keepMounted={false} open={Boolean(menuEl)} onClose={this.onMenuClose}>
                    {devices.map(device => {
                        const {_id, name} = device;

                        return (
                            <MenuItem onClick={this.onSelectDevice.bind(this, _id)} key={_id}>
                                <ListItemIcon>
                                    <VideoLabelIcon />
                                </ListItemIcon>
                                {name}
                            </MenuItem>
                        );
                    })}
                </Menu>
                <Dialog open={open} onClose={this.onDialogClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Save Device Group</DialogTitle>
                    <DialogContent>
                        <TextField
                            name="name"
                            autoFocus
                            margin="dense"
                            label="Device Group Name"
                            fullWidth
                            value={name}
                            onChange={this.onDataChange} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onDialogClose} color="primary">Cancel</Button>
                        <Button onClick={this.onSaveClick} color="primary">Save</Button>
                    </DialogActions>
                </Dialog>
                {Snackbar}
            </div>
        );
    }
}

export default withRouter(
    compose(
        graphql(getDeviceGroup, {
            name: 'data_deviceGroup',
            options: props => ({
                notifyOnNetworkStatusChange: true,
                variables: {
                    _id: get(props, 'match.params._id')
                }
            })
        }),
        graphql(getDevices, {
            name: 'data_devices',
            options: {
                notifyOnNetworkStatusChange: true
            }
        }),
        withStyles(styles)
    )(DeviceGroupForm)
);
