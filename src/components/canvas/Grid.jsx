import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from 'material-ui/styles';
import {withRouter} from 'react-router-dom';
import GridList, {GridListTile} from 'material-ui/GridList';
import axios from 'axios';
import {isEmpty, cloneDeep} from 'lodash';

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
            livePixels: {},
            name: '',
            category: '',
            history: [],
            presetColors: [
                '#D0021B', '#F5A623', '#F8E71C', '#8B572A', '#7ED321', '#417505',
                '#BD10E0', '#9013FE', '#4A90E2', '#50E3C2'
            ]
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
                            livePixels: cloneDeep(pixels),
                            history: [] // blank slate
                        });
                    }
                });
        } else {
            this.setState({
                ...this.state,
                pixels: {},
                livePixels: {},
                name: '',
                category: '',
                history: [{_blank: null}]
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
            pixels: {},
            livePixels: {}
        });
    }

    undoChanges() {
        const history = this.state.history.slice()
        const lastPixelState = history.pop();

        if (!isEmpty(lastPixelState)) {
            this.setState({
                ...this.state,
                pixels: lastPixelState,
                livePixels: lastPixelState,
                history
            });
        }
    }

    onPixelTap(index, drawnIndices = []) {
        const {
            selectedColor,
            history = [],
            presetColors = [],
            pixels = {},
            livePixels = {}
        } = this.state;
        if (!selectedColor.hex) {
            return;
        }

        const oldHistory = history.slice();
        const newHistory = history.slice();
        const color = selectedColor.hex.toUpperCase();
        const colors = presetColors.slice();
        const pixelsToColor = drawnIndices.length ? drawnIndices : [index];
        // old pixel state is authoritative version of last true state
        const oldPixelState = {
            ...pixels
        };
        // new pixel state is current "live" state of pixels
        // we differentiate because multiple pixels could be added via drag, and we want
        // to be able to undo them in one action, instead of one by one
        const newPixelState = {
            ...livePixels
        };

        pixelsToColor.forEach(idx => {
            newPixelState[idx] = color.replace('#', '');
        });

        if (!isEmpty(oldPixelState)) {
            newHistory.push(oldPixelState);
        }

        if (!colors.includes(color)) {
            colors.push(color);
        }

        this.setState({
            ...this.state,
            pixels: newPixelState,
            livePixels: newPixelState,
            history: newHistory,
            presetColors: colors
        });
    }

    onPressAndHold(index) {
        const newHistory = this.state.history.slice();
        // old pixel state is authoritative version of state
        // we'll use it to create a history item
        const oldPixelState = {
            ...this.state.pixels
        };
        // new pixel state represents the "live" state of pixels
        // could be different because of bulk adds via drag
        const newPixelState = {
            ...this.state.livePixels
        };

        delete newPixelState[index];

        if (!isEmpty(oldPixelState)) {
            newHistory.push(oldPixelState);
        }

        this.setState({
            ...this.state,
            pixels: newPixelState,
            livePixels: newPixelState,
            history: newHistory
        });
    }

    onDragMove(index) {
        if (!this.state.selectedColor.hex) {
            return;
        }

        const selectedColor = this.state.selectedColor.hex.toUpperCase();
        const newPixelState = {
            ...this.state.livePixels,
            [index]: selectedColor.replace('#', '')
        };

        // here, we only update the livePixels state
        // normal "pixels" state will be left alone so we can use it in history tracking
        this.setState({
            ...this.state,
            livePixels: newPixelState
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
        const {livePixels: pixels, name, presetColors} = this.state;

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
                                    onPressAndHold={this.onPressAndHold.bind(this)}
                                    onDragMove={this.onDragMove.bind(this)} />
                            );
                        })}
                    </GridList>
                    <Feelsbox
                        color={this.state.selectedColor}
                        disableAlpha={true}
                        presetColors={presetColors}
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