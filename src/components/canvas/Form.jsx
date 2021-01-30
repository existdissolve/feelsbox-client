import {Component, Fragment} from 'react';
import {compose} from 'recompose';
import {graphql} from 'react-apollo';
import {get} from 'lodash';
import {withStyles} from '@material-ui/core/styles';
import {
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Switch,
    TextField
} from '@material-ui/core';

import {getMyCategories} from '-/graphql/category';

class CanvasForm extends Component {
    render() {
        const {formData = {}, frames = [], onChange} = this.props;
        const {categories = [], duration = 1000, name = '', private: isPrivate = false, repeat = false, reverse = false} = formData;
        const myCategories = get(this.props, 'data.myCategories') || [];
        const hasMultipleFrames = frames.length > 1;
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
                <TextField name="name" autoFocus margin="dense" label="Feel Name" fullWidth value={name} onChange={onChange} />
                <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select name="categories" value={categories} onChange={onChange} multiple={true}>
                        {myCategories.map(category => {
                            const {_id, name} = category;

                            return (
                                <MenuItem key={_id} value={_id}>{name}</MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>
                {hasMultipleFrames &&
                    <Fragment>
                        <TextField name="duration" margin="dense" label="Default Frame Length (ms)" fullWidth value={duration || 1000} onChange={onChange} type="number" inputProps={{min: 1, max: 1000000}}  />
                        <FormControl fullWidth>
                            <FormControlLabel control={repeatSwitch} label="Loop?" />
                        </FormControl>
                        <FormControl fullWidth>
                            <FormControlLabel control={reverseSwitch} label="Reverse?" />
                        </FormControl>
                    </Fragment>
                }
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
