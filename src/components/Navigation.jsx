/*global gapi*/
import React from 'react';
import PropTypes from 'prop-types';
import {
    AccountBox as AccountBoxIcon,
    Devices as DevicesIcon,
    ExitToApp as ExitToAppIcon,
    InsertEmoticon as InsertEmoticonIcon,
    ListAlt as ListAltIcon,
    Menu as MenuIcon,
    RecentActors as RecentActorsIcon,
    Replay as ReplayIcon,
    Search as SearchIcon,
    VideoLabel as VideoLabelIcon
} from '@material-ui/icons';
import {
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@material-ui/core';
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
                                    <DevicesIcon />
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
