import React from 'react';
import PropTypes from 'prop-types';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';
import Drawer from 'material-ui/Drawer';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import {withStyles} from 'material-ui/styles';
import {Link} from 'react-router-dom'

const styles = {
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
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

    toggleDrawer(open) {
        this.setState({
            left: open
        });
    };

    render() {
        const {classes} = this.props;

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
                <Drawer open={this.state.left} onClose={this.toggleDrawer.bind(this, false)}>
                    <div
                        tabIndex={0}
                        role="button"
                        onClick={this.toggleDrawer.bind(this, false)}
                        onKeyDown={this.toggleDrawer.bind(this, false)}
                    >
                        <List component="nav">
                            <ListItem button>
                                <Link to="/">
                                    <ListItemText primary="Emojis" />
                                </Link>
                            </ListItem>
                            <ListItem button>
                                <Link to="/canvas">
                                    <ListItemText primary="Create Emoji" />
                                </Link>
                            </ListItem>
                            <ListItem button>
                                <Link to="/upload">
                                    <ListItemText primary="Upload Emoji" />
                                </Link>
                            </ListItem>
                        </List>
                    </div>
                </Drawer>

            </div>
        );
    }
}

Navigation.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Navigation);
