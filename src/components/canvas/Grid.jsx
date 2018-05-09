import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from 'material-ui/styles';
import {withRouter} from 'react-router-dom';
import GridList, {GridListTile} from 'material-ui/GridList';
import axios from 'axios';
import {isEmpty} from 'lodash';

import AppBar from '-/components/AppBar';
import Pixel from '-/components/canvas/Pixel';
import Feelsbox from '-/components/canvas/picker/Feelsbox';
import Form from '-/components/canvas/Form';

const styles = theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        backgroundColor: theme.palette.background.paper,
        padding: 10
    },
    gridList: {
        justifyContent: 'center'
    }
});

const preparePixels = source => {
    const pixels = {};

    Object.keys(source).forEach(item => {
        pixels[item] = {
            c: source[item]
        };
    });

    return pixels;
};

class CanvasGrid extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedColor: '#ffffff',
            pixels: {},
            name: '',
            category: '',
            history: []
        };
    }

    componentWillMount() {
        const {
            match: {
                params: {
                    category,
                    name
                } = {}
            } = {}
        } = this.props;

        if (name) {
            axios.get(`https://feelsbox-server.herokuapp.com/emoji/${name}`)
                .then(result => {
                    const {
                        data: {
                            success,
                            emoji = {}
                        } = {}
                    } = result;

                    if (success) {
                        const {pixels: source} = emoji;
                        const pixels = {};

                        Object.keys(source).forEach(item => {
                            const value = source[item];

                            if (value) {
                                pixels[item] = value.c
                            }
                        });

                        this.setState({
                            ...this.state,
                            name,
                            ...emoji,
                            pixels,
                            history: [] // blank slate
                        });
                    }
                });
        } else {
            this.setState({
                ...this.state,
                pixels: {},
                name: '',
                category: '',
                history: []
            });
        }
    }

    handleChangeComplete(color) {
        this.setState({
            selectedColor: color
        });
    }

    saveEmoji(name, category) {
        const {pixels: source} = this.state;
        const pixels = preparePixels(source);

        axios.put('https://feelsbox-server.herokuapp.com/emoji', {
            pixels,
            name,
            category
        }).then(result => {
            this.props.history.push(`/canvas/${category}/${name}`);
        }).catch(error => {
            console.log(error);
        });
    }

    pushEmoji() {
        const {pixels: source} = this.state;
        const pixels = preparePixels(source);

        axios.post('https://feelsbox-server.herokuapp.com/emoji', {
            pixels
        }).catch(error => {
            console.log(error);
        });
    }

    clearPixels() {
        this.setState({
            ...this.state,
            pixels: {}
        });
    }

    undoChanges() {
        const history = this.state.history.slice()
        const lastPixelState = history.pop();

        if (!isEmpty(lastPixelState)) {
            this.setState({
                ...this.state,
                pixels: lastPixelState,
                history
            });
        }
    }

    onPixelTap(index) {
        const newHistory = this.state.history.slice();
        const oldPixelState = {
            ...this.state.pixels
        };
        const newPixelState = {
            ...this.state.pixels,
            [index]: this.state.selectedColor.hex.replace('#', '')
        };

        if (!isEmpty(oldPixelState)) {
            newHistory.push(oldPixelState);
        }

        this.setState({
            ...this.state,
            pixels: newPixelState,
            history: newHistory
        });
    }

    onPressAndHold(index) {
        const newHistory = this.state.history.slice();
        const oldPixelState = {
            ...this.state.pixels
        };
        const newPixelState = {
            ...this.state.pixels
        };

        delete newPixelState[index];

        if (!isEmpty(oldPixelState)) {
            newHistory.push(oldPixelState);
        }

        this.setState({
            ...this.state,
            pixels: newPixelState,
            history: newHistory
        });
    }

    renderIcons() {
        const {name, category} = this.state;

        return (
            <Form
                name={name}
                category={category}
                onSave={this.saveEmoji.bind(this)}
                onTest={this.pushEmoji.bind(this)}
                onClear={this.clearPixels.bind(this)}
                onUndo={this.undoChanges.bind(this)} />
        );
    }

    render() {
        const {classes} = this.props;
        const nodes = Array(64).fill(true);
        const {pixels, name} = this.state;

        return (
            <div>
                <AppBar title={name ? 'Edit Emoji' : 'Create Emoji'} iconRenderer={this.renderIcons()}/>
                <div className={classes.root}>
                    <GridList className={classes.gridList} cols={8}>
                        {nodes.map((item, index) => {
                            const pixelIndex = index + 1;
                            const color = pixels[pixelIndex];

                            return (
                                <Pixel
                                    key={pixelIndex}
                                    index={pixelIndex}
                                    color={color}
                                    row={Math.floor(index / 8)}
                                    onTap={this.onPixelTap.bind(this)}
                                    onPressAndHold={this.onPressAndHold.bind(this)} />
                            );
                        })}
                    </GridList>
                    <Feelsbox
                        color={this.state.selectedColor}
                        disableAlpha={true}
                        onChangeComplete={this.handleChangeComplete.bind(this)} />
                </div>
            </div>
        );
    }
}

CanvasGrid.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withRouter(withStyles(styles)(CanvasGrid));