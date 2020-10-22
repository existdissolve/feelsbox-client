import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {graphql} from 'react-apollo';
import {compose} from 'recompose';
import {withRouter} from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Fab from '@material-ui/core/Fab';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListSubheader from '@material-ui/core/ListSubheader';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import {get} from 'lodash';

import AppBar from '-/components/AppBar';
import {addCategory, editCategory, getMyCategories} from '-/graphql/category';

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.background.paper
    },
    fab: {
        position: 'absolute',
        bottom: theme.spacing(2),
        right: theme.spacing(2)
    }
});

class CategoryList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentCategory: undefined,
            category: '',
            open: false
        };
    }

    onChange = e => {
        const category = get(e, 'target.value');

        this.setState({category});
    };

    onSaveClick = async() => {
        const {category: name, currentCategory: _id} = this.state;
        const {addCategory, editCategory, showSnackbar} = this.props;

        if (!_id) {
            await addCategory({
                awaitRefetchQueries: true,
                refetchQueries: [{
                    fetchPolicy: 'network-only',
                    query: getMyCategories
                }],
                variables: {
                    data: {name}
                }
            });

            showSnackbar(`"${name}" was added successfully!`);
        } else {
            await editCategory({
                variables: {
                    _id,
                    data: {name}
                }
            });

            showSnackbar(`"${name}" was updated successfully!`);
        }

        this.onDialogClose();
    };

    onAddClick = () => {
        this.setState({
            currentCategory: undefined,
            open: true
        });
    };

    onEditClick = _id => {
        const categories = get(this.props, 'data.myCategories', []);
        const category = categories.find(category => category._id === _id);
        const {name} = category;

        this.setState({
            category: name,
            currentCategory: _id,
            open: true
        });
    };

    onDialogClose = () => {
        this.setState({
            currentCategory: undefined,
            open: false
        });
    };

    render() {
        const {category, currentCategory, open} = this.state;
        const {classes} = this.props;
        const categories = get(this.props, 'data.myCategories', []);
        const action = currentCategory ? 'Edit' : 'Add';

        return (
            <div>
                <AppBar title="Categories" />
                <Dialog open={open} onClose={this.onDialogClose}>
                    <DialogTitle>{action} Category</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus={true}
                            margin="dense"
                            label="Category"
                            fullWidth={true}
                            onChange={this.onChange}
                            value={category} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onDialogClose}>Cancel</Button>
                        <Button onClick={this.onSaveClick}>Submit</Button>
                    </DialogActions>
                </Dialog>
                <div className={classes.root}>
                    <List component="div">
                        <ListSubheader>My Custom Categories</ListSubheader>
                        {categories.map((device, idx) => {
                            const {_id, name} = device;

                            return (
                                <React.Fragment key={_id}>
                                    <ListItem>
                                        <ListItemText primary={name} />
                                        <ListItemSecondaryAction>
                                            <IconButton edge="end" onClick={this.onEditClick.bind(this, _id)}>
                                                <EditIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    {idx !== categories.length - 1 && <Divider />}
                                </React.Fragment>
                            );
                        })}
                    </List>
                </div>
                <Fab className={classes.fab} color="primary" onClick={this.onAddClick}>
                    <AddIcon />
                </Fab>
            </div>
        );
    }
}

export default withRouter(
    compose(
        graphql(getMyCategories, {
            options: {
                notifyOnNetworkStatusChange: true,
                fetchPolicy: 'network-only'
            }
        }),
        graphql(addCategory, {name: 'addCategory'}),
        graphql(editCategory, {name: 'editCategory'}),
        withStyles(styles),

    )(CategoryList)
);
