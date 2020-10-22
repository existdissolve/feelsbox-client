import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {graphql} from 'react-apollo';
import {compose} from 'recompose';
import {withRouter} from 'react-router-dom';
import GridList from '@material-ui/core/GridList';
import {get} from 'lodash';

import Thumb from '-/components/feel/Thumb';
import {getFeels} from '-/graphql/feel';

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.background.paper
    },
    grid: {
        margin: '0px !important'
    }
});

class SearchGrid extends React.Component {
    render() {
        const {classes, showSnackbar} = this.props;
        const feels = get(this.props, 'data.feels', []);

        return (
            <div className={classes.root}>
                <GridList cols={3} cellHeight={64} className={classes.grid}>
                    {feels.map(feel => {
                        const {_id} = feel;

                        return <Thumb feel={feel} key={_id} showSnackbar={showSnackbar} />;
                    })}
                </GridList>
            </div>
        );
    }
}

export default withRouter(
    compose(
        graphql(getFeels, {
            options: props => ({
                notifyOnNetworkStatusChange: true,
                fetchPolicy: 'network-only',
                variables: {
                    criteria: props.criteria
                }
            })
        }),
        withStyles(styles)
    )(SearchGrid)
);
