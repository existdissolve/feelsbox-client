import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from 'material-ui/styles';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import SaveIcon from 'material-ui-icons/Save';
import SettingsRemoteIcon from 'material-ui-icons/SettingsRemote';
import ClearAllIcon from 'material-ui-icons/ClearAll';
import MoreVertIcon from 'material-ui-icons/MoreVert';
import UndoIcon from 'material-ui-icons/Undo';
import TextField from 'material-ui/TextField';
import Input, {InputLabel} from 'material-ui/Input';
import Menu, {MenuItem} from 'material-ui/Menu';
import {FormControl, FormHelperText} from 'material-ui/Form';
import {ListItemIcon, ListItemText} from 'material-ui/List';
import Select from 'material-ui/Select';
import Dialog, {
    DialogActions,
    DialogContent,
    DialogTitle
} from 'material-ui/Dialog';

class CanvasForm extends React.Component {
    constructor(props) {
        super(props);

        const {
            name = '',
            category = ''
        } = props;

        this.state = {
            name,
            category,
            open: false,
            anchorEl: null
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.name !== this.props.name) {
            this.setState({
                ...this.state,
                name: this.props.name,
                category: this.props.category
            });
        }
    }

    onChange(name, event) {
        this.setState({
            [name]: event.target.value
        });
    }

    handleSave() {
        const {name, category} = this.state;
        const {onSave} = this.props;

        onSave(name, category);
        this.handleClose();
    }

    handleClose() {
        this.setState({
            open: false
        });
    }

    handleOpen = () => {
        this.setState({
            open: true,
            anchorEl: null
        });
    }

    handleMenuClick = event => {
        this.setState({
            anchorEl: event.currentTarget
        });
    }

    handleMenuClose = () => {
        this.setState({
            anchorEl: null
        });
    }

    handlerClearClick = () => {
        this.props.onClear();
        this.handleMenuClose();
    }

    render() {
        const {anchorEl} = this.state;

        return (
            <div>
                <IconButton onClick={this.props.onUndo}>
                    <UndoIcon />
                </IconButton>
                <IconButton onClick={this.props.onTest}>
                    <SettingsRemoteIcon />
                </IconButton>
                <IconButton onClick={this.handleMenuClick}>
                    <MoreVertIcon />
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={this.handleMenuClose}
                >
                    <MenuItem onClick={this.handlerClearClick}>
                        <ListItemIcon>
                            <ClearAllIcon />
                        </ListItemIcon>
                        <ListItemText inset primary="Clear All" />
                    </MenuItem>
                    <MenuItem onClick={this.handleOpen}>
                        <ListItemIcon>
                        <SaveIcon />
                        </ListItemIcon>
                        <ListItemText inset primary="Save Emoji" />
                    </MenuItem>
                </Menu>
                <Dialog open={this.state.open} onClose={this.handleClose.bind(this)} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Save Emoji</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Emoji Name"
                            fullWidth
                            value={this.state.name}
                            onChange={this.onChange.bind(this, 'name')} />

                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={this.state.category}
                                onChange={this.onChange.bind(this, 'category')}>
                                <MenuItem value="misc">Miscellaneous</MenuItem>
                                <MenuItem value="food">Food</MenuItem>
                                <MenuItem value="drink">Drinks</MenuItem>
                                <MenuItem value="holiday">Holiday</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose.bind(this)} color="primary">Cancel</Button>
                        <Button onClick={this.handleSave.bind(this)} color="primary">Save</Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

CanvasForm.propTypes = {
    classes: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired
};

export default withStyles({})(CanvasForm);
