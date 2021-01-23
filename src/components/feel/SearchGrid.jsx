import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {graphql} from 'react-apollo';
import {compose} from 'recompose';
import {withRouter} from 'react-router-dom';
import GridList from '@material-ui/core/GridList';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import AddBoxIcon from '@material-ui/icons/AddBox';
import FlipToBackIcon from '@material-ui/icons/FlipToBack';
import IndeterminateCheckBoxIcon from '@material-ui/icons/IndeterminateCheckBox';
import {Typography} from '@material-ui/core';
import {get} from 'lodash';

import Thumb from '-/components/feel/Thumb';
import Loading from '-/components/Loading';
import {copyFeel, getFeels, subscribe, unsubscribe} from '-/graphql/feel';
import client from '-/graphql/client';

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.background.paper
    },
    grid: {
        margin: '0px !important'
    }
});

class SearchGrid extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activeFeel: null,
            anchorEl: null
        };
    }

    onCopyClick = () => {
        const {showSnackbar} = this.props;
        const _id = get(this.state, 'activeFeel._id');

        client.mutate({
            mutation: copyFeel,
            awaitRefetchQueries: true,
            refetchQueries: [{
                fetchPolicy: 'network-only',
                query: getFeels
            }],
            variables: {_id}
        }).then(() => {
            showSnackbar('Added to My Feels!');
        });

        this.onMenuClose();
    };

    onMenuOpen = (anchorEl, activeFeel) => {
        this.setState({
            activeFeel,
            anchorEl
        });
    };

    onMenuClose = () => {
        this.setState({
            anchorEl: undefined
        });
    };

    onSubscribeClick = () => {
        const {showSnackbar} = this.props;
        const _id = get(this.state, 'activeFeel._id');

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
        const _id = get(this.state, 'activeFeel._id');

        client.mutate({
            mutation: unsubscribe,
            variables: {_id}
        }).then(() => {
            showSnackbar('Removed from Favs');
        });

        this.onMenuClose();
    };

    render() {
        const {activeFeel, anchorEl} = this.state;
        const {classes, showSnackbar} = this.props;
        const feels = get(this.props, 'data.feels', []);
        const loading = get(this.props, 'data.loading');
        const menu = [];

        if (activeFeel) {
            const {isSubscribed, isSubscriptionOwner, name} = activeFeel;
            const saveToFavs = (
                <MenuItem onClick={this.onSubscribeClick} key="save_feel">
                    <ListItemIcon>
                        <AddBoxIcon />
                    </ListItemIcon>
                    Save to Favs
                </MenuItem>
            );
            const removeFromFavs = (
                <MenuItem onClick={this.onUnsubscribeClick} key="remove_feel">
                    <ListItemIcon>
                        <IndeterminateCheckBoxIcon />
                    </ListItemIcon>
                    Remove from Favs
                </MenuItem>
            );
            const copyFeel = (
                <MenuItem onClick={this.onCopyClick} key="copy_feel_save">
                    <ListItemIcon>
                        <FlipToBackIcon />
                    </ListItemIcon>
                    Copy to My Feels
                </MenuItem>
            );
            const nameLabel = (
                <MenuItem key="feel-name">
                    <Typography variant="h6">
                        {name}
                    </Typography>
                </MenuItem>
            );

            menu.push(nameLabel);
            menu.push(copyFeel);

            if (!isSubscribed) {
                menu.push(saveToFavs);
            } else if (isSubscriptionOwner) {
                menu.push(removeFromFavs);
            }
        }

        return (
            <div className={classes.root}>
                {loading && <Loading message="Loading Feels..." />}
                {!loading &&
                    <GridList cols={3} cellHeight={64} className={classes.grid}>
                        {feels.map(feel => {
                            const {_id} = feel;

                            return (
                                <Thumb
                                    feel={feel}
                                    key={_id}
                                    displayMode="grid"
                                    menuOpenHandler={this.onMenuOpen}
                                    showSnackbar={showSnackbar} />
                            );
                        })}
                    </GridList>
                }
                <Menu anchorEl={anchorEl} keepMounted={false} open={Boolean(anchorEl)} onClose={this.onMenuClose}>
                    {menu}
                </Menu>
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
