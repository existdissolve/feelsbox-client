import {Component, Fragment} from 'react';
import {withStyles} from '@material-ui/core/styles';
import {graphql} from 'react-apollo';
import {compose} from 'recompose';
import {withRouter} from 'react-router-dom';
import GridList from '@material-ui/core/GridList';
import Subheader from '@material-ui/core/ListSubheader';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import {get} from 'lodash';

import AppBar from '-/components/AppBar';
import Thumb from '-/components/feel/Thumb';
import {getFeels} from '-/graphql/feel';

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.background.paper
    },
    grid: {
        margin: '0px !important'
    },
    fab: {
        position: 'absolute',
        bottom: theme.spacing(2),
        right: theme.spacing(2)
    }
});

class FeelsList extends Component {
    onAddClick = () => {
        const {history} = this.props;

        history.push('/canvas');
    };

    render() {
        const {classes, showSnackbar, Snackbar} = this.props;
        const feels = get(this.props, 'data.feels', []);
        const groupedFeels = feels.filter(feel => feel.active).reduce((groups, feel) => {
            const {category, isSubscribed} = feel;
            let categoryId, categoryName;

            if (isSubscribed) {
                categoryId = '__';
                categoryName = 'Followed Feels';
            } else {
                ({_id: categoryId = 'uncategorized', name: categoryName = 'Uncategorized'} = category || {});
            }

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

            return groups;
        }, []);

        return (
            <div>
                <AppBar title="My Feels" />
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
            options: {
                notifyOnNetworkStatusChange: true,
                fetchPolicy: 'network-only'
            }
        }),
        withStyles(styles)
    )(FeelsList)
);
