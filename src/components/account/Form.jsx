import {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import {withRouter} from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import {get} from 'lodash';

import AppBar from '-/components/AppBar';

const styles = theme => ({
    root: {
        flex: .5,
        padding: 20
    },
    details: {
        marginBottom: 20
    },
    label: {
        fontSize: '.8rem'
    }
});

class AccountForm extends Component {
    constructor(props) {
        super(props);

        const appTheme = localStorage.getItem('appTheme');
        const displayMode = localStorage.getItem('displayMode');

        this.state = {
            appTheme: appTheme || 'blue',
            displayMode: displayMode || 'grid'
        };
    }

    onAppThemeChange = e => {
        const appTheme = get(e, 'target.value');
        const {changeTheme} = this.props;

        this.setState({appTheme}, () => {
            localStorage.setItem('appTheme', appTheme);

            changeTheme(appTheme);
        });
    };

    onDisplayModeChange = e => {
        const displayMode = get(e, 'target.value');

        this.setState({displayMode}, () => {
            localStorage.setItem('displayMode', displayMode);
        });
    };

    render() {
        const {appTheme, displayMode} = this.state;
        const {classes, Snackbar} = this.props;

        return (
            <div>
                <div className={classes.root}>
                    <FormControl component="fieldset" style={{marginBottom: 20}}>
                        <FormLabel component="legend" className={classes.label}>Feels Display Style</FormLabel>
                        <RadioGroup row name="displayMode" defaultValue="grid">
                            <FormControlLabel value="grid" control={<Radio color="primary" checked={displayMode === 'grid'} />} label="Grid" onChange={this.onDisplayModeChange} />
                            <FormControlLabel value="list" control={<Radio color="primary" checked={displayMode === 'list'} />} label="List" onChange={this.onDisplayModeChange} />
                        </RadioGroup>
                    </FormControl>

                    <FormControl component="fieldset">
                        <FormLabel component="legend" className={classes.label}>Theme</FormLabel>
                        <RadioGroup row name="appTheme" defaultValue="blue">
                            <FormControlLabel value="blue" control={<Radio color="primary" checked={appTheme === 'blue'} />} label="Blue" onChange={this.onAppThemeChange} />
                            <FormControlLabel value="sorbet" control={<Radio color="primary" checked={appTheme === 'sorbet'} />} label="Sorbet" onChange={this.onAppThemeChange} />
                            <FormControlLabel value="grassy" control={<Radio color="primary" checked={appTheme === 'grassy'} />} label="Grassy" onChange={this.onAppThemeChange} />
                            <FormControlLabel value="ocean" control={<Radio color="primary" checked={appTheme === 'ocean'} />} label="Ocean" onChange={this.onAppThemeChange} />
                            <FormControlLabel value="sunrise" control={<Radio color="primary" checked={appTheme === 'sunrise'} />} label="Sunrise" onChange={this.onAppThemeChange} />
                        </RadioGroup>
                    </FormControl>
                    {Snackbar}
                </div>
            </div>
        );
    }
}

export default withRouter(
    withStyles(styles)(AccountForm)
);