import {Component} from 'react';
import {compose} from 'recompose';
import {withStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

class FramesForm extends Component {
    render() {
        const {brightness, duration, hasMultipleFrames = false, onChange} = this.props;

        return (
            <div>
                <TextField
                    name="brightness"
                    margin="dense"
                    label="Brightness %"
                    fullWidth
                    value={brightness}
                    onChange={onChange}
                    type="number"
                    inputProps={{min: 0, max: 100}}  />

                {hasMultipleFrames &&
                    <TextField
                        name="duration"
                        margin="dense"
                        label="Frame Length (ms)"
                        fullWidth
                        value={duration}
                        onChange={onChange}
                        type="number"
                        inputProps={{min: 1, max: 100000}}  />
                }
            </div>
        );
    }
}

export default compose(
    withStyles({})
)(FramesForm);
