import React from 'react';
import * as firebase from 'firebase';

import EmojiGrid from '-/components/emoji/Grid';
import AppBar from '-/components/AppBar';
import {getCategorizedData} from '-/utils/categories';

class Main extends React.Component {
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
            return null;
        }

        const categorizedData = getCategorizedData(data);

        return (
            <div>
                <AppBar title="Emojis" />
                <div>
                    {Object.keys(categorizedData).map(key => {
                        return <EmojiGrid data={categorizedData[key]} category={key} key={key} />
                    })}
                </div>
            </div>
        );
    }
}

export default Main;