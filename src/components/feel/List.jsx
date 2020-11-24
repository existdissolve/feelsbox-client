import {Component, Fragment} from 'react';
import {withStyles} from '@material-ui/core/styles';
import {graphql} from 'react-apollo';
import {compose} from 'recompose';
import {withRouter} from 'react-router-dom';
import GridList from '@material-ui/core/GridList';
import Subheader from '@material-ui/core/ListSubheader';
import Fab from '@material-ui/core/Fab';
import ListAltIcon from '@material-ui/icons/ListAlt';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Toolbar from '@material-ui/core/Toolbar';
import RecentActorsIcon from '@material-ui/icons/RecentActors';
import {get} from 'lodash';

import AppBar from '-/components/AppBar';
import Thumb from '-/components/feel/Thumb';
import {getMyCategories} from '-/graphql/category';
import {getFeels} from '-/graphql/feel';

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.background.paper
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
        backgroundColor: '#222'
    },
    grow: {
        flexGrow: 1
    },
    carousel: {

    }
});

class FeelsList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            carouselMode: false,
            categories: [],
            selectedFeels: []
        };
    }

    onAddClick = () => {
        const {history} = this.props;

        history.push('/canvas');
    };

    onCategoriesChanges = e => {
        const categories = get(e, 'target.value');

        this.setState({categories});
    };

    onCarouselClick = () => {
        const {carouselMode} = this.state;

        if (carouselMode) {

        } else {

        }

        this.state({carouselMode: !carouselMode});
    }

    render() {
        const {categories: filter = []} = this.state;
        const {classes, showSnackbar, Snackbar} = this.props;
        const feels = get(this.props, 'data_feels.feels', []);
        const myCategories = get(this.props, 'data_categories.myCategories') || [];
        const groupedFeels = feels.filter(feel => feel.active).reduce((groups, feel) => {
            const {categories = [], isSubscribed} = feel;

            if (isSubscribed || !categories.length) {
                if (filter.length) {
                    return groups;
                }

                const categoryId = isSubscribed ? '__' : 'uncategorized';
                const categoryName = isSubscribed ? 'Followed Feels' : 'Uncategorized';
                const group = groups.find(item => item._id === categoryId);

                if (!group) {
                    groups.push({
                        _id: categoryId,
                        name: categoryName,
                        feels: [feel]
                    });
                } else {
                    group.feels.push(feel);
                }
            } else {
                categories.forEach(category => {
                    const {_id, name} = category;

                    if (filter.length && !filter.includes(_id)) {
                        return false;
                    }

                    const group = groups.find(item => item._id === _id);

                    if (!group) {
                        groups.push({
                            _id,
                            name,
                            feels: [feel]
                        });
                    } else {
                        group.feels.push(feel);
                    }
                });
            }

            return groups.sort((prev, next) => {
                const {name: pn} = prev;
                const {name: nn} = next;

                return pn < nn ? -1 : pn > nn ? 1 : 0;
            });
        }, []);
        const adornment = (
            <InputAdornment position="start">
                <ListAltIcon />
            </InputAdornment>
        );

        /*
            <IconButton onClick={this.onCarouselClick} className={classes.carousel} edge="end">
                <RecentActorsIcon />
            </IconButton>
        */

        return (
            <div>
                <AppBar title="My Feels" />
                <Toolbar className={classes.toolbar} variant="dense" disableGutters={false}>
                    <Select value={filter} onChange={this.onCategoriesChanges} startAdornment={adornment} multiple={true} autoWidth={false} style={{width: '50%'}}>
                        {myCategories.map(category => {
                            const {_id, name} = category;

                            return (
                                <MenuItem key={_id} value={_id}>{name}</MenuItem>
                            );
                        })}
                    </Select>
                    <div className={classes.grow} />

                </Toolbar>
                <div className={classes.root}>
                    {groupedFeels.map(group => {
                        const {_id, name, feels = []} = group;

                        return (
                            <Fragment key={_id}>
                                <Subheader component="div">{name}</Subheader>
                                <GridList cols={3} cellHeight={64} className={classes.grid}>
                                    {feels.map(feel => {
                                        const {_id} = feel;

                                        return <Thumb feel={feel} key={_id} showSnackbar={showSnackbar} />;
                                    })}
                                </GridList>
                            </Fragment>

                        );
                    })}
                </div>
                {Snackbar}
                <Fab className={classes.fab} color="primary" onClick={this.onAddClick}>
                    <AddIcon />
                </Fab>
            </div>
        );
    }
}

export default withRouter(
    compose(

        graphql(getFeels, {
            name: 'data_feels',
            options: {
                notifyOnNetworkStatusChange: true
            }
        }),
        graphql(getMyCategories, {
            name: 'data_categories',
            options: {
                notifyOnNetworkStatusChange: true
            }
        }),
        withStyles(styles)
    )(FeelsList)
);
