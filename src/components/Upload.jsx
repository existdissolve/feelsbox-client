import React from 'react';
import Input, {InputLabel} from 'material-ui/Input';
import {FormControl, FormHelperText} from 'material-ui/Form';
import Select from 'material-ui/Select';
import {withStyles} from 'material-ui/styles';
import {MenuItem} from 'material-ui/Menu';
import TextField from 'material-ui/TextField';
import Button, {RaisedButton} from 'material-ui/Button';

import AppBar from '-/components/AppBar';

const styles = theme => ({
    root: {
        padding: '10px'
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: '90%'
    },
    input: {
        display: 'none'
    },
    submit: {
        marginLeft: 7,
        marginTop: 20
    }
});

class Upload extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            emoji: '',
            category: '',
            png: ''
        };
    }

    handleChange = e => {
        const {name, value} = e.target;

        this.setState({
            ...this.state,
            [name]: value
        });
    }

    render() {
        const {classes} = this.props;

        return (
            <div>
                <AppBar title="Upload" />
                <form className={classes.root} action="https://feelsbox-server.herokuapp.com/upload" method="POST" encType="multipart/form-data" target="_blank">
                    <div>
                        <FormControl className={classes.formControl}>
                            <InputLabel htmlFor="category">Category</InputLabel>
                            <Select
                                value={this.state.category}
                                onChange={this.handleChange}
                                inputProps={{
                                    name: 'category',
                                    id: 'category'
                                }}>
                                <MenuItem value="misc">Miscellaneous</MenuItem>
                                <MenuItem value="food">Food</MenuItem>
                                <MenuItem value="drink">Drinks</MenuItem>
                                <MenuItem value="event">Holiday & Events</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <div>
                        <FormControl className={classes.formControl}>
                            <TextField
                                id="emoji"
                                name="emoji"
                                label="Name"
                                value={this.state.emoji}
                                onChange={this.handleChange}
                                margin="normal" />
                        </FormControl>
                    </div>
                    <div>
                        <FormControl className={classes.formControl}>
                            <input
                                type="file"
                                name="png"
                                id="png"
                                accept="image/*"
                                onChange={this.handleChange}
                                className={classes.input} />
                            <label htmlFor="png">
                                <Button variant="raised" component="span">Choose File</Button>
                            </label>
                        </FormControl>
                    </div>

                    <Button type="submit" variant="raised" color="primary" className={classes.submit}>Submit</Button>
                </form>
            </div>
        );
    }
}

export default withStyles(styles)(Upload);