import {Component, Fragment} from 'react';
import {withRouter} from 'react-router-dom';
import {compose} from 'recompose';
import {graphql} from 'react-apollo';
import {get} from 'lodash';

import Grid from '-/components/canvas/Grid';
import Panorama from '-/components/canvas/Panorama';
import {Loading} from '-/components/shared';
import {addFeel, editFeel, getFeel, getFeels, testFeel} from '-/graphql/feel';

class Canvas extends Component {
    render() {
        const isLoading = get(this.props, 'data.loading');
        const isPanorama = get(this.props, 'data.feel.isPanorama');

        return (
            <Fragment>
                {isLoading && <Loading message="Loading Your Feels..." />}
                {!isLoading && isPanorama && <Panorama {...this.props} />}
                {!isLoading && !isPanorama && <Grid {...this.props} />}
            </Fragment>
        );
    }
}

export default withRouter(
    compose(
        graphql(getFeel, {
            options: props => ({
                notifyOnNetworkStatusChange: true,
                variables: {
                    _id: get(props, 'match.params._id')
                }
            })
        }),
        graphql(addFeel, {name: 'addFeel'}),
        graphql(editFeel, {name: 'editFeel'}),
        graphql(testFeel, {name: 'testFeel'})
    )(Canvas)
);
