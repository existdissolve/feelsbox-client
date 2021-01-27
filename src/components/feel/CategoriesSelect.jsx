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
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import GridList from '@material-ui/core/GridList';
import InputAdornment from '@material-ui/core/InputAdornment';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Subheader from '@material-ui/core/ListSubheader';
import Toolbar from '@material-ui/core/Toolbar';
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
import ListAltIcon from '@material-ui/icons/ListAlt';
import SettingsRemoteIcon from '@material-ui/icons/SettingsRemote';

import AppBar from '-/components/AppBar';
import SimpleThumb from '-/components/feel/SimpleThumb';
import Loading from '-/components/Loading';
import {groupFeels} from '-/components/feel/utils';

import {getMyCategories} from '-/graphql/category';
import {getFeels} from '-/graphql/feel';
import {addFeelGroup, editFeelGroup, getFeelGroup} from '-/graphql/feelGroup';
import client from '-/graphql/client';

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        marginTop: 56,
        display: 'flex',
        flexDirection: 'column',
        //overflowY: 'hidden',
        height: 'calc(100vh - 56px)'
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
        backgroundColor: '#222',
        minHeight: 'auto'
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

class CategoriesSelect extends Component {
    constructor(props) {
        super(props);

        this.state = {
            categories: []
        };
    }

    onCategoriesChange = e => {
        const categories = get(e, 'target.value');
        const {categorySelectionHandler} = this.props;

        this.setState({categories}, () => {
            if (typeof categorySelectionHandler === 'function') {
                categorySelectionHandler(categories);
            }
        });
    };

    render() {
        const {categories: filter = []} = this.state;
        const myCategories = get(this.props, 'data_categories.myCategories') || [];
        const adornment = (
            <InputAdornment position="start">
                <ListAltIcon />
            </InputAdornment>
        );

        return (
            <Select
                value={filter}
                onChange={this.onCategoriesChange}
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
        );
    }
}

export default withRouter(
    compose(
        graphql(getMyCategories, {
            name: 'data_categories',
            options: {
                notifyOnNetworkStatusChange: true
            }
        }),
        withStyles(styles)
    )(CategoriesSelect)
);
