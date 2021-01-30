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
import Divider from '@material-ui/core/Divider';
import GridList from '@material-ui/core/GridList';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Subheader from '@material-ui/core/ListSubheader';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';
import ClearAllIcon from '@material-ui/icons/ClearAll';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import SaveIcon from '@material-ui/icons/Save';

import AppBar from '-/components/AppBar';
import SimpleThumb from '-/components/feel/SimpleThumb';
import Loading from '-/components/Loading';
import CategoriesSelect from '-/components/feel/CategoriesSelect';
import {groupFeels} from '-/components/feel/utils';

import {getFeels} from '-/graphql/feel';
import {addFeelGroup, editFeelGroup, getFeelGroup, getFeelGroups} from '-/graphql/feelGroup';
import client from '-/graphql/client';

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        marginTop: 103,
        display: 'flex',
        flexDirection: 'column',
        //overflowY: 'hidden',
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
        margin: '0px !important'
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

class FeelGroupsForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeFeelIdx: null,
            categories: [],
            duration: 1000,
            name: 'New Feels Group',
            open: false,
            selectedFeels: []
        };
    }

    componentDidUpdate(nextProps) {
        const nextLoading = get(nextProps, 'data_feelGroup.loading');
        const currLoading = get(this.props, 'data_feelGroup.loading');

        if (nextLoading !== currLoading) {
            const feelsGroup = get(this.props, 'data_feelGroup.feelGroup') || {};
            const {duration = 1000, feels: selectedFeels = [], name = 'New Feels Group'} = feelsGroup;

            this.setState({
                duration,
                name,
                selectedFeels
            });
        }
    }

    onCategoriesChange = categories => {
        this.setState({categories});
    };

    onClearClick = () => {
        this.setState({selectedFeels: []});
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

    onFeelSelect = _id => {
        const feels = get(this.props, 'data_feels.feels', []);
        const feel = feels.find(feel => feel._id === _id);

        if (feel) {
            const {selectedFeels} = this.state;
            const newFeels = selectedFeels.slice();

            newFeels.push(feel);

            this.setState({
                selectedFeels: newFeels
            });
        }
    };

    onFeelTap = (idx, _id) => {
        const {activeFeelIdx} = this.state;
        const feels = get(this.props, 'data_feels.feels', []);
        const feel = feels.find(feel => feel._id === _id);

        if (feel) {
            if (activeFeelIdx === idx) {
                this.setState({activeFeelIdx: null});
            } else {
                this.setState({activeFeelIdx: idx});
            }
        }
    };

    onNextClick = () => {
        const {activeFeelIdx, selectedFeels = []} = this.state;
        const mutatableFeels = selectedFeels.slice();
        const activeFeel = mutatableFeels[activeFeelIdx];
        // always remove
        mutatableFeels.splice(activeFeelIdx, 1);

        let newIndex;

        if (activeFeelIdx < selectedFeels.length - 1) {
            mutatableFeels.splice(activeFeelIdx + 1, 0, activeFeel);
            newIndex = activeFeelIdx + 1;
        } else {
            mutatableFeels.unshift(activeFeel);
            newIndex = 0;
        }

        this.setState({
            activeFeelIdx: newIndex,
            selectedFeels: mutatableFeels
        });
    };

    onPreviousClick = () => {
        const {activeFeelIdx, selectedFeels = []} = this.state;
        const mutatableFeels = selectedFeels.slice();
        const activeFeel = mutatableFeels[activeFeelIdx];
        // always remove
        mutatableFeels.splice(activeFeelIdx, 1);

        let newIndex;

        if (activeFeelIdx === 0) {
            mutatableFeels.push(activeFeel);
            newIndex = selectedFeels.length - 1;
        } else {
            mutatableFeels.splice(activeFeelIdx - 1, 0, activeFeel);
            newIndex = activeFeelIdx - 1;
        }

        this.setState({
            activeFeelIdx: newIndex,
            selectedFeels: mutatableFeels
        });
    };

    onRemoveClick = () => {
        const {activeFeelIdx, selectedFeels = []} = this.state;
        const mutatableFeels = selectedFeels.slice();

        mutatableFeels.splice(activeFeelIdx, 1);

        this.setState({
            activeFeelIdx: null,
            selectedFeels: mutatableFeels
        });
    };

    onSaveClick = async() => {
        const {history} = this.props;
        const _id = get(this.props, 'match.params._id');
        const {duration, name, selectedFeels} = this.state;
        const data = {
            duration: parseInt(duration),
            feels: selectedFeels.map(feel => feel._id),
            name
        };

        if (_id !== 'new') {
            await client.mutate({
                mutation: editFeelGroup,
                variables: {_id, data}
            });
        } else {
            const result = await client.mutate({
                mutation: addFeelGroup,
                refetchQueries: [{
                    fetchPolicy: 'network-only',
                    query: getFeelGroups
                }],
                variables: {data}
            });
            const newId = get(result, 'data.addFeelGroup._id');

            history.push(`/feelgroups/${newId}`);
        }

        this.onDialogClose();
    };

    render() {
        const {activeFeelIdx, categories: filter = [], duration, name, open, selectedFeels = []} = this.state;
        const {classes, Snackbar} = this.props;
        const feels = get(this.props, 'data_feels.feels', []);
        const loading = get(this.props, 'data_feelGroup.loading');
        const feelsLoading = get(this.props, 'data_feels.loading', false);
        const groupedFeels = groupFeels(feels, {filter});
        const isActive = activeFeelIdx != null;
        const icons = (
            <IconButton onClick={this.onEditClick} disabled={!selectedFeels.length}>
                <SaveIcon />
            </IconButton>
        );
        const extraContent = (
            <Toolbar className={classes.toolbar} variant="dense" disableGutters={true}>
                <Tooltip title="Remove all Feels">
                    <IconButton onClick={this.onClearClick}>
                        <ClearAllIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Remove selected Feel">
                    <IconButton onClick={this.onRemoveClick} disabled={!isActive}>
                        <CloseIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Move selected Feel to the left">
                    <IconButton onClick={this.onPreviousClick} disabled={!isActive}>
                        <NavigateBeforeIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Move selected Feel to the right">
                    <IconButton onClick={this.onNextClick} disabled={!isActive}>
                        <NavigateNextIcon />
                    </IconButton>
                </Tooltip>
            </Toolbar>
        );

        return (
            <div style={{overflow: 'hidden'}}>
                <AppBar title="Edit Feels Group" extraContent={extraContent} iconRenderer={icons} />
                <div className={classes.root}>
                    {loading && <Loading message="Loading Your Feels Group..." />}
                    {!loading &&
                        <Fragment>
                            <div className={classes.selections}>
                                <Subheader component="div" className={classes.subheader}>{name}</Subheader>
                                {selectedFeels.length === 0 &&
                                    <Typography component="p" gutterBottom={true} paragraph={true} style={{padding: 20}}>
                                        You haven&apos;t added any feels to the group...yet!
                                    </Typography>
                                }
                                <GridList cols={3} cellHeight={64} className={classes.grid}>
                                    {selectedFeels.map((feel, idx) => {
                                        const {_id} = feel;
                                        const isSelected = idx === activeFeelIdx;

                                        return (
                                            <SimpleThumb
                                                key={`${_id}_${idx}`}
                                                displayMode="grid"
                                                feel={feel}
                                                isSelected={isSelected}
                                                selectionHandler={this.onFeelTap.bind(this, idx)} />
                                        );
                                    })}
                                </GridList>
                            </div>
                            <Toolbar position="fixed" className={classes.toolbar} variant="dense" disableGutters={false}>
                                <CategoriesSelect categorySelectionHandler={this.onCategoriesChange} />
                            </Toolbar>
                            <div className={classes.options}>
                                <List component="div" dense={true} style={{padding: 0}}>
                                    {feelsLoading && <Loading message="Loading Your Feels..." />}
                                    {groupedFeels.map(group => {
                                        const {_id, name, feels = []} = group;

                                        return (
                                            <Fragment key={_id}>
                                                <ListSubheader className={classes.subheader}>{name}</ListSubheader>

                                                {feels.map((feel, idx) => {
                                                    const {_id} = feel;
                                                    const content = (
                                                        <ListItem key={_id} component="div" className={classes.listItem}>
                                                            <ListItemIcon className={classes.listIcon}>
                                                                <SimpleThumb
                                                                    displayMode="list"
                                                                    feel={feel}
                                                                    selectionHandler={this.onFeelSelect} />
                                                            </ListItemIcon>
                                                            <ListItemText primary={feel.name} style={{flexGrow: 1}} />
                                                            <ListItemIcon className={classes.listitemicon} onClick={this.onFeelSelect.bind(this, _id)} style={{minWidth: 'auto'}}>
                                                                <Tooltip title="Add Feel to group">
                                                                    <IconButton edge="end">
                                                                        <AddIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </ListItemIcon>
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
                            </div>
                        </Fragment>
                    }
                </div>
                <Dialog open={open} onClose={this.onDialogClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Save Feels Group</DialogTitle>
                    <DialogContent>
                        <TextField
                            name="name"
                            autoFocus
                            margin="dense"
                            label="Feels Group Name"
                            fullWidth
                            value={name}
                            onChange={this.onDataChange} />

                        <TextField
                            name="duration"
                            margin="dense"
                            label="Transition Length (ms)"
                            fullWidth
                            value={duration || 1000}
                            onChange={this.onDataChange}
                            type="number"
                            inputProps={{min: 1, max: 1000000}}  />
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
        graphql(getFeelGroup, {
            name: 'data_feelGroup',
            options: props => ({
                notifyOnNetworkStatusChange: true,
                variables: {
                    _id: get(props, 'match.params._id')
                }
            })
        }),
        graphql(getFeels, {
            name: 'data_feels',
            options: {
                notifyOnNetworkStatusChange: true
            }
        }),
        withStyles(styles)
    )(FeelGroupsForm)
);
