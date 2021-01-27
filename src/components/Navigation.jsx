/*global gapi*/
import React from 'react';
import PropTypes from 'prop-types';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon';
import SearchIcon from '@material-ui/icons/Search';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ListAltIcon from '@material-ui/icons/ListAlt';
import RecentActorsIcon from '@material-ui/icons/RecentActors';
import ReplayIcon from '@material-ui/icons/Replay';
import VideoLabelIcon from '@material-ui/icons/VideoLabel';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import {withStyles} from '@material-ui/core/styles';
import {Link, withRouter} from 'react-router-dom';

const styles = {
    menuButton: {
        marginLeft: -12,
        marginRight: 20
    },
    link: {
        textDecoration: 'none',
        color: 'white'
    }
};

class Navigation extends React.Component {
    constructor(props) {
        super(props);

        this.toggleDrawer = this.toggleDrawer.bind(this);

        this.state = {
            left: false
        };
    }

    toggleDrawer = open => {
        this.setState({
            left: open
        });
    };

    onLogoutClick = async() => {
        const auth2 = gapi.auth2.getAuthInstance();

        await auth2.signOut();

        location.reload();
    };

    onReloadClick = () => {
        location.reload();
    };

    render() {
        const {classes} = this.props;
        const {left} = this.state;

        return (
            <div>
                <IconButton
                    className={classes.menuButton}
                    color="inherit"
                    aria-label="Menu"
                    onClick={this.toggleDrawer.bind(this, true)}
                >
                    <MenuIcon />
                </IconButton>
                <Drawer open={left} onClose={this.toggleDrawer.bind(this, false)}>
                    <div
                        tabIndex={0}
                        role="button"
                        onClick={this.toggleDrawer.bind(this, false)}
                        onKeyDown={this.toggleDrawer.bind(this, false)}
                    >
                        <List component="nav">
                            <ListItem button>
                                <ListItemIcon>
                                    <InsertEmoticonIcon />
                                </ListItemIcon>
                                <Link to="/feels" className={classes.link}>
                                    <ListItemText primary="My Feels" />
                                </Link>
                            </ListItem>
                            <ListItem button>
                                <ListItemIcon>
                                    <RecentActorsIcon />
                                </ListItemIcon>
                                <Link to="/feelgroups" className={classes.link}>
                                    <ListItemText primary="Feels Groups" />
                                </Link>
                            </ListItem>
                            <ListItem button>
                                <ListItemIcon>
                                    <SearchIcon />
                                </ListItemIcon>
                                <Link to="/feels/search" className={classes.link}>
                                    <ListItemText primary="Find Feels" />
                                </Link>
                            </ListItem>
                            <ListItem button>
                                <ListItemIcon>
                                    <ListAltIcon />
                                </ListItemIcon>
                                <Link to="/categories" className={classes.link}>
                                    <ListItemText primary="Categories" />
                                </Link>
                            </ListItem>
                            <ListItem button>
                                <ListItemIcon>
                                    <VideoLabelIcon />
                                </ListItemIcon>
                                <Link to="/devices" className={classes.link}>
                                    <ListItemText primary="Devices" />
                                </Link>
                            </ListItem>
                            <ListItem button>
                                <ListItemIcon>
                                    <VideoLabelIcon />
                                </ListItemIcon>
                                <Link to="/devicegroups" className={classes.link}>
                                    <ListItemText primary="Device Groups" />
                                </Link>
                            </ListItem>
                            <ListItem button>
                                <ListItemIcon>
                                    <AccountBoxIcon />
                                </ListItemIcon>
                                <Link to="/account" className={classes.link}>
                                    <ListItemText primary="My Account" />
                                </Link>
                            </ListItem>
                            <ListItem button>
                                <ListItemIcon>
                                    <ReplayIcon />
                                </ListItemIcon>
                                <ListItemText primary="Reload" onClick={this.onReloadClick} />
                            </ListItem>
                            <ListItem button>
                                <ListItemIcon>
                                    <ExitToAppIcon />
                                </ListItemIcon>
                                <ListItemText primary="Logout" onClick={this.onLogoutClick} />
                            </ListItem>
                        </List>
                    </div>
                </Drawer>

            </div>
        );
    }
}

Navigation.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withRouter(
    withStyles(styles)(Navigation)
);
