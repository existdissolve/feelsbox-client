import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {compose} from 'recompose';
import {withRouter} from 'react-router-dom';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import Select from '@material-ui/core/Select';
import Toolbar from '@material-ui/core/Toolbar';
import CloseIcon from '@material-ui/icons/Close';
import SortIcon from '@material-ui/icons/Sort';
import {get} from 'lodash';

import {AppBar, IconButton} from '-/components/shared';
import SearchGrid from '-/components/feel/SearchGrid';

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        marginTop: 56
    },
    grid: {
        margin: '0px !important'
    },
    toolbar: {
        backgroundColor: '#222'
    },
    search: {
        marginLeft: 20
    }
});

class SearchList extends React.Component {
    constructor(props) {
        super(props);

        this.timer;
        this.state = {
            open: false,
            search: '',
            text: '',
            sort: 'MOSTPOPULAR'
        };
    }

    onSearchChange = e => {
        const search = get(e, 'target.value');
        clearTimeout(this.timer);

        this.timer = setTimeout(() => {
            clearTimeout(this.timer);

            this.timer = null;
            this.setState({text: search});
        }, 400);

        this.setState({search});
    };

    onSortChange = e => {
        const sort = get(e, 'target.value');

        this.setState({sort});
    };

    onClose = () => {
        this.setState({open: false});
    };

    onOpen = () => {
        this.setState({open: true});
    };

    onClearSearchClick = () => {
        this.setState({search: '', text: ''});
    };

    render() {
        const {open, search, sort, text} = this.state;
        const {classes, showSnackbar} = this.props;
        const criteria = {
            searchType: 'ALL',
            sortType: sort,
            text
        };
        const adornment = (
            <InputAdornment position="start">
                <SortIcon />
            </InputAdornment>
        );
        const searchAdornment = (
            <InputAdornment position="end">
                <IconButton Icon={CloseIcon} onClick={this.onClearSearchClick} title="Clear Search" />
            </InputAdornment>
        );

        return (
            <div>
                <AppBar title="Feels" />
                <div className={classes.root}>
                    <Toolbar className={classes.toolbar} variant="dense" disableGutters={false}>
                        <Select open={open} onClose={this.onClose} onOpen={this.onOpen} value={sort} onChange={this.onSortChange} startAdornment={adornment}>
                            <MenuItem value="MOSTPOPULAR">Most Popular</MenuItem>
                            <MenuItem value="MOSTRECENT">Most Recent</MenuItem>
                        </Select>
                        <Input type="text" value={search} onChange={this.onSearchChange} endAdornment={searchAdornment} placeholder="Search" className={classes.search} />
                    </Toolbar>
                    <SearchGrid criteria={criteria} showSnackbar={showSnackbar} />
                </div>
            </div>
        );
    }
}

export default withRouter(
    compose(
        withStyles(styles)
    )(SearchList)
);
