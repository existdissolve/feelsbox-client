import {Component, Fragment} from 'react';
import {withStyles} from '@material-ui/core/styles';
import {compose} from 'recompose';
import {graphql} from 'react-apollo';
import copy from 'copy-to-clipboard';
import {
    Button,
    Divider,
    InputAdornment,
    List,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    TextField,
    Typography
} from '@material-ui/core';
import {
    Clear as ClearIcon,
    FileCopy as FileCopyIcon,
    Save as SaveIcon,
    SupervisedUserCircle as SupervisedUserCircleIcon
} from '@material-ui/icons';
import {get} from 'lodash';

import {AppBar, IconButton} from '-/components/shared';
import {editDevice, generateCode, getDevice} from '-/graphql/device';

const styles = theme => ({
    root: {
        padding: 20,
        marginTop: 56,
        backgroundColor: theme.palette.background.paper
    },
    details: {
        marginBottom: 10,
        fontWeight: 600
    },
    access: {
        marginTop: 20,
        marginBottom: 10,
        fontWeight: 600
    },
    paragraph: {
        marginBottom: 20
    }
});

class DeviceForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            access: [],
            code: '',
            removals: [],
            name: ''
        };
    }

    componentDidUpdate(prevProps) {
        const prevDevice = get(prevProps, 'data.device');
        const device = get(this.props, 'data.device');

        if (typeof prevDevice === 'undefined' && device) {
            const {access = [], name} = device;

            this.setState({access, name});
        }
    }

    onNameChange = e => {
        const name = get(e, 'target.value');

        this.setState({name});
    };

    onAddClick = async() => {
        const _id = get(this.props, 'data.device._id');
        const {generateCode} = this.props;

        const result = await generateCode({
            variables: {_id}
        });
        const code = get(result, 'data.generateDeviceCode');

        if (code) {
            this.setState({code});
        }
    };

    onCopyClick = () => {
        const {code} = this.state;
        const {showSnackbar} = this.props;

        copy(code);

        showSnackbar('Code Copied!');
    };

    onRemoveAccessClick = _id => {
        const {access: originalAccess = [], removals: originalRemovals = []} = this.state;
        const access = originalAccess.splice();
        const removals = originalRemovals.slice();
        const index = access.findIndex(item => get(item, 'user._id') === _id);

        removals.push(_id);

        if (index !== -1) {
            access.splice(index, 1);
        }

        this.setState({
            access,
            removals
        });
    };

    onSaveClick = async() => {
        const {name, removals} = this.state;
        const _id = get(this.props, 'data.device._id');
        const {editDevice, showSnackbar} = this.props;

        await editDevice({
            variables: {
                _id,
                data: {
                    name,
                    removals
                }
            }
        });

        showSnackbar('Device successfully saved!');
    };

    render() {
        const {access = [], code, name} = this.state;
        const {classes, Snackbar} = this.props;
        const editIcon = (
            <IconButton Icon={SaveIcon} onClick={this.onSaveClick} title="Save device" />
        );

        const copyIcon = (
            <InputAdornment position="end">
                <IconButton Icon={FileCopyIcon} edge="end" size="small" onClick={this.onCopyClick} title="Copy code" />
            </InputAdornment>
        );

        return (
            <div>
                <AppBar title="Edit Device" iconRenderer={editIcon} />
                <div className={classes.root}>
                    <Typography variant="subtitle1" className={classes.details}>Device Details</Typography>
                    <TextField
                        InputLabelProps={{shrink: true}}
                        fullWidth={true}
                        label="Device Name"
                        onChange={this.onNameChange}
                        placeholder="Your Device Name"
                        value={name}
                    />
                    <Typography variant="subtitle1" className={classes.access}>Access Control</Typography>
                    <Typography variant="body2" className={classes.paragraph}>
                        Feel the love! Generate a code to share with friends and family to let them send feels to this device!
                    </Typography>
                    <Button
                        className={classes.paragraph}
                        color="primary"
                        onClick={this.onAddClick}
                        variant="contained">Generate Access Code</Button>
                    <TextField
                        InputLabelProps={{shrink: true}}
                        InputProps={{
                            endAdornment: copyIcon
                        }}
                        disabled={true}
                        fullWidth={true}
                        value={code}
                    />

                    <Typography variant="subtitle1" className={classes.access}>Authorized Users</Typography>
                    <List component="div">
                        {access.map((item, idx) => {
                            const email = get(item, 'user.email');
                            const _id = get(item, 'user._id');

                            return (
                                <Fragment key={email}>
                                    <ListItem disableGutters>
                                        <ListItemIcon>
                                            <SupervisedUserCircleIcon />
                                        </ListItemIcon>
                                        <ListItemText primary={email} />
                                        <ListItemSecondaryAction>
                                            <IconButton Icon={ClearIcon} edge="end" size="small" onClick={this.onRemoveAccessClick.bind(this, _id)} title="Remove Access" />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    {idx !== access.length - 1 && <Divider />}
                                </Fragment>
                            );
                        })}
                    </List>
                    {Snackbar}
                </div>
            </div>
        );
    }
}

export default compose(
    graphql(generateCode, {name: 'generateCode'}),
    graphql(editDevice, {name: 'editDevice'}),
    graphql(getDevice, {
        options: props => ({
            fetchPolicy: 'network-only',
            notifyOnNetworkStatusChange: true,
            variables: {
                _id: get(props, 'match.params._id')
            }
        })
    }),
    withStyles(styles)
)(DeviceForm);
