import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from 'material-ui/styles';
import {withRouter} from 'react-router-dom';
import GridList, {GridListTile} from 'material-ui/GridList';
import axios from 'axios';

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
            category: ''
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
                            pixels
                        });
                    }
                });
        } else {
            this.setState({
                ...this.state,
                pixels: {},
                name: '',
                category: ''
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

    onPixelTap(index) {
        this.setState({
            ...this.state,
            pixels: {
                ...this.state.pixels,
                [index]: this.state.selectedColor.hex.replace('#', '')
            }
        });
    }

    onPressAndHold(index) {
        const pixels = {
            ...this.state.pixels
        };

        delete pixels[index];

        this.setState({
            ...this.state,
            pixels
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
                onClear={this.clearPixels.bind(this)} />
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