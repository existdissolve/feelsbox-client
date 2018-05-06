import React from 'react';
import * as firebase from 'firebase';
import {withStyles} from 'material-ui/styles';
import {CircularProgress} from 'material-ui/Progress';

import EmojiGrid from '-/components/emoji/Grid';
import {getCategorizedData} from '-/utils/categories';

const styles = theme => ({
    progress: {
        margin: '200px auto',
        display: 'block'
    }
});

class EmojiList extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            data: null
        };
    }

    componentWillMount() {
        firebase.database().ref('feelings').once('value').then(snapshot => {
            this.setState({
                data: snapshot.val()
            });
        });
    }

    render() {
        const {data} = this.state;

        if (!data) {
            return (
                <CircularProgress className={this.props.classes.progress} size="50%" />
            );
        }

        const categorizedData = getCategorizedData(data);

        return (
            <div>
                {Object.keys(categorizedData).map(key => {
                    return <EmojiGrid data={categorizedData[key]} category={key} key={key} />
                })}
            </div>
        );
    }
}

export default withStyles(styles)(EmojiList);