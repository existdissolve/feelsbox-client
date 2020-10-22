import React from 'react';
import {compose} from 'recompose';
import {graphql} from 'react-apollo';
import {withStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Select from '@material-ui/core/Select';
import {get} from 'lodash';

import {getMyCategories} from '-/graphql/category';

class CanvasForm extends React.Component {
    render() {
        const {formData = {}, onChange} = this.props;
        const {category = {}, fps, name, private: isPrivate, repeat, reverse} = formData;
        const {_id: categoryId} = category;
        const categories = get(this.props, 'data.myCategories') || [];
        const privateSwitch = (
            <Switch name="private" checked={!!isPrivate} onChange={onChange} />
        );
        const reverseSwitch = (
            <Switch name="reverse" checked={!!reverse} onChange={onChange} />
        );
        const repeatSwitch = (
            <Switch name="repeat" checked={!!repeat} onChange={onChange} />
        );

        return (
            <div>
                <TextField name="name" autoFocus margin="dense" label="Emoji Name" fullWidth value={name} onChange={onChange} />
                <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select name="category" value={categoryId} onChange={onChange}>
                        {categories.map(category => {
                            const {_id, name} = category;

                            return (
                                <MenuItem key={_id} value={_id}>{name}</MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>
                <TextField name="fps" margin="dense" label="Frames Per Second" fullWidth value={fps} onChange={onChange} type="number" inputProps={{min: 1, max: 100}}  />
                <FormControl fullWidth>
                    <FormControlLabel control={repeatSwitch} label="Loop?" />
                </FormControl>
                <FormControl fullWidth>
                    <FormControlLabel control={reverseSwitch} label="Reverse?" />
                </FormControl>
                <FormControl fullWidth>
                    <FormControlLabel control={privateSwitch} label="Private?" />
                </FormControl>
            </div>
        );
    }
}

export default compose(
    graphql(getMyCategories, {
        options: {
            notifyOnNetworkStatusChange: true
        }
    }),
    withStyles({})
)(CanvasForm);
