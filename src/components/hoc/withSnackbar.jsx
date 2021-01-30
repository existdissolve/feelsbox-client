import {Component} from 'react';
import {IconButton, Snackbar} from '@material-ui/core';
import {Clear as ClearIcon} from '@material-ui/icons';

const withSnackbar = () => WrappedComponent => {
    return class extends Component {
        constructor(props) {
            super(props);

            this.snackbarDefaults = {
                action: (
                    <React.Fragment>
                        <IconButton size="small" onClick={this.onSnackbarClose}>
                            <ClearIcon fontSize="small" />
                        </IconButton>
                    </React.Fragment>
                ),
                anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'center'
                },
                autoHideDuration: 3000
            };

            this.state = {
                snackbar: {
                    isVisible: false,
                    ...this.snackbarDefaults
                }
            };
        }

        showSnackbar = (message, opts) => {
            const {snackbar} = this.state;

            this.setState({
                snackbar: {
                    ...snackbar,
                    ...opts,
                    message,
                    isVisible: true
                }
            });
        };

        hideSnackbar = opts => {
            const {snackbarDefaults} = this;

            this.setState({
                snackbar: {
                    ...snackbarDefaults,
                    ...opts,
                    isVisible: false
                }
            });
        };

        render() {
            const {snackbar} = this.state;
            const {action, anchorOrigin, autoHideDuration, isVisible, message} = snackbar;
            const SnackbarComponent = (
                <Snackbar
                    anchorOrigin={anchorOrigin}
                    open={isVisible}
                    autoHideDuration={autoHideDuration}
                    onClose={this.hideSnackbar}
                    message={message}
                    action={action}
                />
            );
            return (
                <WrappedComponent
                    {...this.props}
                    hideSnackbar={this.hideSnackbar}
                    showSnackbar={this.showSnackbar}
                    Snackbar={SnackbarComponent} />
            );
        }
    };
};

export default withSnackbar;
