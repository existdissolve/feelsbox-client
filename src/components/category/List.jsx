import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {graphql} from 'react-apollo';
import {compose} from 'recompose';
import {withRouter} from 'react-router-dom';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Fab,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    ListSubheader,
    TextField
} from '@material-ui/core';
import {Add as AddIcon, Edit as EditIcon} from '@material-ui/icons';
import {get} from 'lodash';

import {AppBar, IconButton, Loading} from '-/components/shared';
import {addCategory, editCategory, getMyCategories} from '-/graphql/category';

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
        overflowY: 'auto',
        marginTop: 56
    },
    fab: {
        position: 'absolute',
        bottom: theme.spacing(2),
        right: theme.spacing(2)
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
        const loading = get(this.props, 'data.loading');
        const action = currentCategory ? 'Edit' : 'Add';

        return (
            <div className={classes.container}>
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
                        <Button onClick={this.onDialogClose} color="default" variant="contained" size="small">Cancel</Button>
                        <Button onClick={this.onSaveClick} color="secondary" variant="contained" size="small">Submit</Button>
                    </DialogActions>
                </Dialog>
                <div className={classes.root}>
                    {loading && <Loading message="Loading Categories..." />}
                    {!loading &&
                        <List component="div" style={{padding: 0}}>
                            <ListSubheader className={classes.subheader}>My Custom Categories</ListSubheader>
                            {categories.map((device, idx) => {
                                const {_id, name} = device;

                                return (
                                    <React.Fragment key={_id}>
                                        <ListItem>
                                            <ListItemText primary={name} />
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    edge="end"
                                                    Icon={EditIcon}
                                                    onClick={this.onEditClick.bind(this, _id)}
                                                    title="Edit category" />
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        {idx !== categories.length - 1 && <Divider />}
                                    </React.Fragment>
                                );
                            })}
                        </List>
                    }
                </div>
                <Fab className={classes.fab} color="secondary" onClick={this.onAddClick}>
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
                notifyOnNetworkStatusChange: true
            }
        }),
        graphql(addCategory, {name: 'addCategory'}),
        graphql(editCategory, {name: 'editCategory'}),
        withStyles(styles)
    )(CategoryList)
);
