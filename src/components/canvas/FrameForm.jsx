import {Component} from 'react';
import {compose} from 'recompose';
import {withStyles} from '@material-ui/core/styles';
import {
    FormControl,
    FormControlLabel,
    Switch,
    TextField
} from '@material-ui/core';

class FramesForm extends Component {
    render() {
        const {duration, onChange, repeat, reverse} = this.props;

        const reverseSwitch = (
            <Switch name="testReverse" checked={!!reverse} onChange={onChange} />
        );
        const repeatSwitch = (
            <Switch name="testRepeat" checked={!!repeat} onChange={onChange} />
        );

        return (
            <div>
                <TextField name="testDuration" margin="dense" label="Frame Length (ms)" fullWidth value={duration || 1000} onChange={onChange} type="number" inputProps={{min: 1, max: 100000}}  />
                <FormControl fullWidth>
                    <FormControlLabel control={repeatSwitch} label="Loop?" />
                </FormControl>
                <FormControl fullWidth>
                    <FormControlLabel control={reverseSwitch} label="Reverse?" />
                </FormControl>
            </div>
        );
    }
}

export default compose(
    withStyles({})
)(FramesForm);
