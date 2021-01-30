import {Component, Fragment} from 'react';
import moment from 'moment';
import {withRouter} from 'react-router-dom';
import {withStyles} from '@material-ui/core/styles';
import {graphql} from 'react-apollo';
import {compose} from 'recompose';
import {
    Divider,
    GridList,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText
} from '@material-ui/core';
import {AddCircleOutline as AddCircleOutlineIcon} from '@material-ui/icons';
import {get} from 'lodash';

import {AppBar, Dialog, Loading} from '-/components/shared';
import {getHistory} from '-/graphql/history';
import {cloneFromHistory} from '-/graphql/feel';
import client from '-/graphql/client';

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        marginTop: 56
    },
    gridList: {
        justifyContent: 'center',
        display: 'flex',
        flexDirection: 'row',
        flexFlow: 'row wrap',
        alignItems: 'stretch',
        alignContent: 'flex-start',
        width: 40,
        height: 40,
        margin: '0px !important',
        padding: 4,
        boxShadow: '0px 1px 5px 0px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.2), 0px 3px 1px -2px rgba(0, 0, 0, 0.2)',
        '&:active': {
            background: '#3f51b5'
        }
    }
});

class DeviceList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeId: null,
            open: false
        };
    }

    onAddClick = _id => {
        this.setState({
            activeId: _id,
            open: true
        });
    };

    onConfirmClick = async() => {
        const {showSnackbar} = this.props;
        const {activeId} = this.state;

        client.mutate({
            mutation: cloneFromHistory,
            variables: {_id: activeId}
        }).then(() => {
            showSnackbar('Feel was successfully added!');
            this.onDialogClose();
        });
    };

    onDialogClose = () => {
        this.setState({
            activeId: null,
            open: false
        });
    };

    render() {
        const {open} = this.state;
        const {classes} = this.props;
        const history = get(this.props, 'data.history', []);
        const loading = get(this.props, 'data.loading');

        return (
            <div>
                <AppBar title="History" />
                <Dialog
                    cancelBtnText="Nevermind"
                    cancelHandler={this.onDialogClose}
                    closeHandler={this.onDialogClose}
                    okBtnText="Do It!"
                    okHandler={this.onConfirmClick}
                    open={open}
                    text="Are you sure you want to create a new Feel from this history item? Don&apos;t worry...it will start off uncategorized, and you can tweak it however you like when you&apos;re ready!"
                    title="Create New Feel?" />
                <div className={classes.root}>
                    {loading && <Loading message="Loading History..." />}
                    {!loading &&
                        <List component="div" dense={true}>
                            {history.map((item, idx) => {
                                const {_id, createdAt, feelSnapshot = {}} = item;
                                const {frames = []} = feelSnapshot;
                                const thumb = frames.find(frame => frame.isThumb) || frames[0];
                                const nodes = Array(64).fill(true);

                                return (
                                    <Fragment key={_id}>
                                        <ListItem>
                                            <ListItemText>
                                                <GridList className={classes.gridList} cols={8}>
                                                    {nodes.map((item, index) => {
                                                        const {pixels = []} = thumb;
                                                        const pixel = pixels.find(pixel => pixel.position === index) || {};
                                                        const {color = '000'} = pixel;

                                                        return (
                                                            <div key={index} style={{backgroundColor: `#${color}`, width: 4, height: 4}}> </div>
                                                        );
                                                    })}
                                                </GridList>
                                            </ListItemText>
                                            <ListItemText primary={moment(createdAt).format('MM/DD/YY hh:mm a')} />
                                            <ListItemSecondaryAction>
                                                <AddCircleOutlineIcon edge="end" onClick={this.onAddClick.bind(this, _id)} />
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        {idx !== history.length - 1 && <Divider />}
                                    </Fragment>
                                );
                            })}
                        </List>
                    }
                </div>
            </div>
        );
    }
}

export default withRouter(
    compose(
        graphql(getHistory, {
            options: props => ({
                fetchPolicy: 'network-only',
                notifyOnNetworkStatusChange: true,
                variables: {
                    criteria: {
                        device: get(props, 'match.params._id')
                    }
                }
            })
        }),
        withStyles(styles),
    )(DeviceList)
);
