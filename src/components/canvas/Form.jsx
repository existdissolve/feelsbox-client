import {Component, Fragment} from 'react';
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

class CanvasForm extends Component {
    render() {
        const {formData = {}, frames = [], onChange} = this.props;
        const {category = '', fps = 0, name = '', private: isPrivate = false, repeat = false, reverse = false} = formData;
        const categories = get(this.props, 'data.myCategories') || [];
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
                <TextField name="name" autoFocus margin="dense" label="Emoji Name" fullWidth value={name} onChange={onChange} />
                <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select name="category" value={category} onChange={onChange}>
                        {categories.map(category => {
                            const {_id, name} = category;

                            return (
                                <MenuItem key={_id} value={_id}>{name}</MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>
                {hasMultipleFrames &&
                    <Fragment>
                        <TextField name="fps" margin="dense" label="Frames Per Second" fullWidth value={fps || 0} onChange={onChange} type="number" inputProps={{min: 0, max: 100}}  />
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
