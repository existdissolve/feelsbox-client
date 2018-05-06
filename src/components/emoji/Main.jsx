import React from 'react';

import EmojiList from '-/components/emoji/List';
import AppBar from '-/components/AppBar';

class Main extends React.Component {
    render() {
        return (
            <div>
                <AppBar title="Emojis" />
                <EmojiList />
            </div>
        );
    }
}

export default Main;