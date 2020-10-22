import {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {get} from 'lodash';
import {compose} from 'recompose';

import {withStyles} from '@material-ui/core/styles';
import {withRouter} from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import AddBoxIcon from '@material-ui/icons/AddBox';
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
import IndeterminateCheckBoxIcon from '@material-ui/icons/IndeterminateCheckBox';
import {removeFeel, subscribe, unsubscribe} from '-/graphql/feel';
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
            anchorEl: undefined,
            dialogEl: undefined
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

    onMenuClose = () => {
        this.setState({anchorEl: undefined});
    };

    onDialogClose = () => {
        this.setState({dialogEl: undefined});
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
        const {feel, history} = this.props;
        const {_id} = feel;
        const {currentTarget} = e;

        this.timer = setTimeout(() => {
            clearTimeout(this.timer);

            this.timer = null;
            this.setState({anchorEl: currentTarget});
            //history.push(`/canvas/${_id}`);
        }, 500);
    };

    onTouchEnd = () => {
        const name = get(this.props, 'feel.name');

        if (!this.timer) {
            return false;
        }

        if (this.isDragging) {
            this.isDragging = false;
            return false;
        }

        clearTimeout(this.timer);
        this.onTap(name);
    };

    onTap = feel => {
        /*axios.get(`${apiURL}/emote/${emoji}`)
            .catch(error => {
                console.log(error);
            });
        */
    };

    onTouchMove = e => {
        clearTimeout(this.timer);

        this.isDragging = true;
    };

    render() {
        const {anchorEl, dialogEl} = this.state;
        const {classes, feel} = this.props;
        const {frames = [], isOwner, isSubscribed, name} = feel;
        const frame = frames.find(frame => frame.isThumb) || frames[0];
        const {pixels} = frame;
        const grid = new Array(64).fill(true);
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
        const actions = [edit, remove];

        return (
            <Fragment>
                <GridListTile style={{width: '33%'}}>
                    <div>
                        <a id={name} className={classes.emoji} onTouchStart={this.onTouchStart} onTouchEnd={this.onTouchEnd} onTouchMove={this.onTouchMove}>
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
                <Menu anchorEl={anchorEl} keepMounted={true} open={Boolean(anchorEl)} onClose={this.onMenuClose}>
                    {isOwner && actions}
                    {!isOwner && !isSubscribed &&
                        <MenuItem onClick={this.onSubscribeClick}>
                            <ListItemIcon>
                                <AddBoxIcon />
                            </ListItemIcon>
                            Save to Favs
                        </MenuItem>
                    }
                    {!isOwner && isSubscribed &&
                        <MenuItem onClick={this.onUnsubscribeClick}>
                            <ListItemIcon>
                                <IndeterminateCheckBoxIcon />
                            </ListItemIcon>
                            Remove from Favs
                        </MenuItem>
                    }
                </Menu>
                <Dialog open={Boolean(dialogEl)} onClose={this.onDialogClose}>
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
            </Fragment>
        );
    }
}

Thumb.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withRouter(
    compose(
        withStyles(styles)
    )(Thumb)
);