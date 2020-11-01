/*global FB, gapi */
import {Component} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import {compose} from 'recompose';
import {Redirect, Route, Switch, withRouter} from 'react-router-dom';
import {get, isUndefined} from 'lodash';

import Feels from '-/components/feel/List';
import Search from '-/components/feel/Search';
import CanvasGrid from '-/components/canvas/Grid';
import Categories from '-/components/category/List';
import Devices from '-/components/device/List';
import DeviceForm from '-/components/device/Form';
import DeviceHistory from '-/components/device/History';
import Login from '-/components/Login';
import {login} from '-/graphql/authentication';
import client from '-/graphql/client';
import withSnackbar from '-/components/hoc/withSnackbar';

var auth2;

class Landing extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loginChecks: {
                facebook: undefined,
                google: undefined
            },
            loggedIn: false
        };
    }

    addScript = (id, src) => {
        const [root] = document.getElementsByTagName('script');

        if (document.getElementById(id)) {
            return;
        }

        const script = document.createElement('script');

        script.id = id;
        script.src = src;
        root.parentNode.insertBefore(script, root);
    };

    componentDidMount() {
        const client_id = '355779476097-o2euqmi58qc4br3q7kgon7l9remq5hva.apps.googleusercontent.com';
        const appId = 258803718399430;

        this.addScript('google-jssdk', '//apis.google.com/js/platform.js?onload=googleAsyncInit');
        this.addScript('facebook-jssdk', '//connect.facebook.net/en_US/sdk.js');

        window.googleAsyncInit = () => {
            gapi.load('auth2', () => {
                auth2 = gapi.auth2.init({
                    client_id,
                    scope: 'profile'
                });

                if (auth2.isSignedIn.get()) {
                    auth2.signIn();
                } else {
                    const {loginChecks} = this.state;

                    this.setState({
                        loginChecks: {
                            ...loginChecks,
                            google: true
                        }
                    });
                }

                auth2.isSignedIn.listen(this.onGoogleAuthEvent);
            });
        };

        window.fbAsyncInit = () => {
            FB.Event.subscribe('auth.statusChange', this.onFBAuthEvent);

            FB.init({
                appId,
                cookie: true,
                status: true,
                xfbml: true,
                version: 'v6.0'
            });
        };
    }

    onFBAuthEvent = async response => {
        const {status} = response;
        let isLoggedIn = false;

        if (status === 'connected') {
            const data = await new Promise((resolve) => {
                FB.api('/me', {fields: 'email'}, response => {
                    resolve(response);
                });
            });
            const {email} = data;

            if (email) {
                isLoggedIn = await this.login(email);
            }
        }

        const {loginChecks} = this.state;

        this.setState({
            ...isLoggedIn && {loggedIn: true},
            loginChecks: {
                ...loginChecks,
                facebook: true
            }
        });
    };

    onGoogleAuthEvent = async value => {
        let isLoggedIn = false;

        alert(value)

        if (value) {
            try {
                const auth2 = gapi.auth2.getAuthInstance();
                const googleUser = auth2.currentUser.get();
                const profile = googleUser.getBasicProfile();
                const email = profile.getEmail();

                alert(email);

                isLoggedIn = await this.login(email);
            } catch (ex) {
                alert(ex);
            }
        }

        const {loginChecks} = this.state;

        this.setState({
            ...isLoggedIn && {loggedIn: true},
            loginChecks: {
                ...loginChecks,
                google: true
            }
        });
    };

    login = async email => {
        const {loggedIn} = this.state;

        if (loggedIn) {
            return true;
        }

        const results = await client.mutate({
            mutation: login,
            variables: {email}
        });

        return get(results, 'data.login', false);
    };

    render() {
        const {loggedIn, loginChecks = {}} = this.state;
        const {facebook, google} = loginChecks;
        const {location = {}, showSnackbar, Snackbar} = this.props;
        const {pathname} = location;
        const isFacebookDone = !isUndefined(facebook);
        const isGoogleDone = !isUndefined(google);
        // if not logged in AND both auth checks aren't yet finished, just show loader
        if (!loggedIn && (!isFacebookDone || !isGoogleDone)) {
            return <div>Loading...</div>;
        }

        if (!loggedIn && pathname !== '/signin') {
            // if not logged in and not on the signin page, go to signin page
            return <Redirect to="/signin" push={true} />;
        } else if (loggedIn && pathname === '/signin') {
            // if we're on the signin page (somehow) and auth has already happened, go back to start
            return <Redirect to="/" push={true} />;
        }

        return (
            <div>
                <CssBaseline />
                <Switch>
                    <Route exact path="/signedin">
                        <Redirect to="/feels" />
                    </Route>
                    <Route exact path="/signin">
                        <Login {...this.props} showSnackbar={showSnackbar} />
                    </Route>
                    <Route exact path="/canvas">
                        <CanvasGrid {...this.props} showSnackbar={showSnackbar} />
                    </Route>
                    <Route exact path="/categories">
                        <Categories {...this.props} showSnackbar={showSnackbar} />
                    </Route>
                    <Route exact path="/devices/:_id/history">
                        <DeviceHistory {...this.props} showSnackbar={showSnackbar} />
                    </Route>
                    <Route exact path="/devices/:_id">
                        <DeviceForm {...this.props} showSnackbar={showSnackbar} />
                    </Route>
                    <Route exact path="/devices">
                        <Devices {...this.props} showSnackbar={showSnackbar} />
                    </Route>
                    <Route exact path="/canvas/:_id">
                        <CanvasGrid {...this.props} showSnackbar={showSnackbar} />
                    </Route>
                    <Route exact path="/feels">
                        <Feels {...this.props} showSnackbar={showSnackbar} />
                    </Route>
                    <Route exact path="/feels/search">
                        <Search {...this.props} showSnackbar={showSnackbar} />
                    </Route>
                    <Route>
                        <Redirect to="/feels" />
                    </Route>
                </Switch>
                {Snackbar}
            </div>
        );
    }
}

export default withRouter(
    compose(
        withSnackbar()
    )(Landing)
);
