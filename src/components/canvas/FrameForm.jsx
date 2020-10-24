import {Component} from 'react';
import {compose} from 'recompose';
import {withStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

class FramesForm extends Component {
    render() {
        const {fps, onChange, repeat, reverse} = this.props;

        const reverseSwitch = (
            <Switch name="testReverse" checked={!!reverse} onChange={onChange} />
        );
        const repeatSwitch = (
            <Switch name="testRepeat" checked={!!repeat} onChange={onChange} />
        );

        return (
            <div>
                <TextField name="testFps" margin="dense" label="Frames Per Second" fullWidth value={fps || 0} onChange={onChange} type="number" inputProps={{min: 0, max: 100}}  />
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
