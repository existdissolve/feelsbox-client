import {Component, Fragment} from 'react';
import {withStyles} from '@material-ui/core/styles';
import {graphql} from 'react-apollo';
import {compose} from 'recompose';
import {withRouter} from 'react-router-dom';
import {get} from 'lodash';
import {
    Fab,
    GridList,
    List,
    ListItem,
    ListItemIcon,
    ListSubheader,
    Typography
} from '@material-ui/core';
import {
    Add as AddIcon,
    Close as CloseIcon,
    Edit as EditIcon,
    VideoLabel as VideoLabelIcon
} from '@material-ui/icons';

import {AppBar, Dialog, IconButton, Loading} from '-/components/shared';

import {getDeviceGroups, removeDeviceGroup} from '-/graphql/deviceGroup';
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
    devicepilltext: {
        display: 'inline-block',
        position: 'relative',
        margin: '0 0 0 10px',
        top: '-7px'
    },
    fab: {
        position: 'fixed',
        bottom: theme.spacing(2),
        right: theme.spacing(2),
        zIndex: 10000000
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
            dialogEl: undefined
        };
    }

    onDialogClose = () => {
        this.setState({
            activeGroup: undefined,
            deviceEl: undefined,
            dialogEl: undefined
        });
    };

    onAddClick = () => {
        const {history} = this.props;

        history.push('/devicegroups/new');
    };

    onEditClick = () => {
        const {history} = this.props;
        const _id = get(this.state, 'activeGroup._id');

        history.push(`/devicegroups/${_id}`);
    };

    onIconClick = (activeGroup, fn, e) => {
        e.persist();

        this.setState({activeGroup}, () => {
            this[fn](e);
        });
    };

    onRemoveClick = e => {
        this.setState({dialogEl: e.target});
    };

    onRemoveSubmit = async() => {
        const {showSnackbar} = this.props;
        const _id = get(this.state, 'activeGroup._id');

        client.mutate({
            mutation: removeDeviceGroup,
            variables: {_id},
            refetchQueries: [{
                fetchPolicy: 'network-only',
                query: getDeviceGroups
            }]
        }).then(() => {
            showSnackbar('Device Group was successfully removed');
        });

        this.onDialogClose();
    };

    render() {
        const {activeGroup, dialogEl} = this.state;
        const {classes, Snackbar} = this.props;
        const deviceGroups = get(this.props, 'data_deviceGroups.deviceGroups', []);
        const loading = get(this.props, 'data_deviceGroups.loading');
        const DevicePill = props => {
            const {name} = props;

            return (
                <div className={classes.devicepill}>
                    <VideoLabelIcon className={classes.devicepillicon} />
                    <span className={classes.devicepilltext}>{name}</span>
                </div>
            );
        };

        return (
            <div className={classes.container}>
                <AppBar title="My Device Groups" />
                {activeGroup &&
                    <Fragment>
                        <Dialog
                            cancelHandler={this.onDialogClose}
                            closeHandler={this.onDialogClose}
                            okBtnText="Yes"
                            okHandler={this.onRemoveSubmit}
                            open={Boolean(dialogEl)}
                            text="Are you sure you want to remove this Device Group from your collection permanently?"
                            title="Remove Device Group?" />
                    </Fragment>
                }
                <div className={classes.root} style={{marginTop: 56}}>
                    {loading && <Loading message="Loading Your Device Groups..." />}
                    {!loading &&
                        <List component="div" dense={true} style={{padding: 0}}>
                            {deviceGroups.length === 0 &&
                                <Typography component="p" gutterBottom={true} paragraph={true} style={{padding: 20}}>
                                    You haven&apos;t added any device groups yet!
                                </Typography>
                            }
                            {deviceGroups.map(group => {
                                const {_id, name, devices = []} = group;

                                return (
                                    <Fragment key={_id}>
                                        <ListSubheader component="div" className={classes.subheader}>
                                            <List component="div" dense={true} style={{padding: 0, display: 'flex'}}>
                                                <ListItem style={{flexGrow: 1}}>{name}</ListItem>
                                                <ListItemIcon className={classes.listitemicon} onClick={this.onIconClick.bind(this, group, 'onEditClick')}>
                                                    <IconButton Icon={EditIcon} className={classes.smallicon} title="Edit device group" />
                                                </ListItemIcon>
                                                <ListItemIcon className={classes.listitemicon} onClick={this.onIconClick.bind(this, group, 'onRemoveClick')}>
                                                    <IconButton Icon={CloseIcon} className={classes.smallicon} edge="end" title="Remove device group" />
                                                </ListItemIcon>
                                            </List>
                                        </ListSubheader>
                                        <GridList cols={2} className={classes.grid}>
                                            {devices.map(device => {
                                                const {_id, name} = device;

                                                return (
                                                    <DevicePill key={_id} name={name} />
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
        graphql(getDeviceGroups, {
            name: 'data_deviceGroups',
            options: {
                notifyOnNetworkStatusChange: true
            }
        }),
        withStyles(styles)
    )(FeelGroupsList)
);
