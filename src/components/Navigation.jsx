import React from 'react';
import PropTypes from 'prop-types';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';
import InsertEmoticonIcon from 'material-ui-icons/InsertEmoticon';
import PaletteIcon from 'material-ui-icons/Palette';
import FileUploadIcon from 'material-ui-icons/FileUpload';
import AcUnitIcon from 'material-ui-icons/AcUnit';
import Drawer from 'material-ui/Drawer';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import {withStyles} from 'material-ui/styles';
import {Link} from 'react-router-dom';
import axios from 'axios';

const styles = {
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
    link: {
        textDecoration: 'none',
        marginLeft: '15px'
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

    onWeatherClick = () => {
        axios.get('https://feelsbox-server.herokuapp.com/weather')
            .catch(ex => {
                console.log(ex);
            });
    }

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
                                <ListItemIcon>
                                    <InsertEmoticonIcon />
                                </ListItemIcon>
                                <Link to="/" className={classes.link}>
                                    <ListItemText primary="Emojis" />
                                </Link>
                            </ListItem>
                            <ListItem button>
                                <ListItemIcon>
                                    <PaletteIcon />
                                </ListItemIcon>
                                <Link to="/canvas" className={classes.link}>
                                    <ListItemText primary="Create Emoji" />
                                </Link>
                            </ListItem>
                            <ListItem button>
                                <ListItemIcon>
                                    <FileUploadIcon />
                                </ListItemIcon>
                                <Link to="/upload" className={classes.link}>
                                    <ListItemText primary="Upload Emoji" />
                                </Link>
                            </ListItem>
                            <ListItem button>
                                <ListItemIcon>
                                    <AcUnitIcon />
                                </ListItemIcon>
                                <ListItemText primary="View Weather" onClick={this.onWeatherClick} />
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
