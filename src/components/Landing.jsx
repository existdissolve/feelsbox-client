import React from 'react';
import CssBaseline from 'material-ui/CssBaseline';
import {Route} from 'react-router-dom';

import Main from '-/components/emoji/Main';
import CanvasGrid from '-/components/canvas/Grid';
import Upload from '-/components/Upload';

class Landing extends React.Component {
    render() {
        return (
            <div>
                <CssBaseline />
                <Route exact path="/" component={Main} />
                <Route exact path="/canvas" component={CanvasGrid} />
                <Route exact path="/canvas/:category/:name" component={CanvasGrid} />
                <Route exact path="/upload" component={Upload}/>
            </div>
        );
    }
}

export default Landing;
