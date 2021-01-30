import {Component, Fragment} from 'react';
import moment from 'moment';
import {withStyles} from '@material-ui/core/styles';
import {graphql} from 'react-apollo';
import {compose} from 'recompose';
import {withRouter} from 'react-router-dom';
import Divider from '@material-ui/core/Divider';
import GridList from '@material-ui/core/GridList';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import {get} from 'lodash';

import {getMessages} from '-/graphql/message';
import Loading from '-/components/Loading';

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        overflow: 'auto'
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

class MessageList extends Component {
    render() {
        const {classes} = this.props;
        const messages = get(this.props, 'data.messages', []);
        const loading = get(this.props, 'data.loading');

        return (
            <div className={classes.root}>
                {loading && <Loading message="Loading Your Messages..." />}
                {!loading &&
                    <List component="div" dense={true}>
                        {messages.map((item, idx) => {
                            const {_id, createdAt, feelSnapshot = {}, message} = item;
                            const name = get(item, 'createdBy.name', 'N/A');
                            const {frames = []} = feelSnapshot;
                            const thumb = frames.find(frame => frame.isThumb) || frames[0];
                            const nodes = Array(64).fill(true);

                            return (
                                <Fragment key={_id}>
                                    <ListItem>
                                        <ListItemText style={{width: 40, flex: 'none', marginRight: 20}}>
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
                                        <ListItemText primary={message} style={{textAlign: 'left', flex: '10 1 100%'}} />
                                        <ListItemText
                                            style={{width: 130, paddingLeft: 10}}
                                            primary={
                                                <div style={{fontSize: '.1rem'}}>
                                                    {name}<br />
                                                    {moment(createdAt).format('MM/DD/YY')}<br />
                                                    {moment(createdAt).format('hh:mm a')}
                                                </div>
                                            } />
                                    </ListItem>
                                    {idx !== history.length - 1 && <Divider />}
                                </Fragment>
                            );
                        })}
                        {messages.length === 0 &&
                            <Typography component="p" gutterBottom={true} paragraph={true} style={{padding: 20}}>
                                You haven&apos;t received any messages...yet!
                            </Typography>
                        }
                    </List>
                }
            </div>
        );
    }
}

export default withRouter(
    compose(
        graphql(getMessages, {
            options: () => ({
                fetchPolicy: 'network-only',
                notifyOnNetworkStatusChange: true
            })
        }),
        withStyles(styles)
    )(MessageList)
);
