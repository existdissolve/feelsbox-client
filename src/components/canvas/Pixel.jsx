import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import GridListTile from '@material-ui/core/GridListTile';
import {includes} from 'lodash';

const styles = {
    pixel: {
        flex: '1 1 0px',
        flexBasis: 'calc(50vw / 4)',
        height: 'calc(50vw / 4)'
    },
    even: {
        backgroundColor: '#000'
    },
    odd: {
        backgroundColor: '#333'
    }
};

let timer;

class Pixel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isDrawing: false,
            drawnIndices: []
        };
    }

    onTouchStart() {
        const {onPressAndHold, index} = this.props;

        timer = setTimeout(() => {
            clearTimeout(timer);
            timer = null;
            onPressAndHold(index);
        }, 500);
    }

    onTouchEnd() {
        const {onTap, index} = this.props;
        const {drawnIndices, isDrawing} = this.state;

        if (!timer && !isDrawing) {
            return false;
        }

        this.setState({
            isDrawing: false,
            drawnIndices: []
        });

        clearTimeout(timer);
        onTap(index, drawnIndices);
    }

    onTouchMove(e) {
        const {touches} = e;
        const touch = touches[0];

        if (touch) {
            const target = document.elementFromPoint(touch.clientX, touch.clientY);

            if (target && target.parentNode) {
                const index = parseInt(target.parentNode.id.replace('pixel-', ''), 10);
                const {drawnIndices} = this.state;
                const copiedIndices = drawnIndices.slice();

                if (!includes(copiedIndices, index)) {
                    copiedIndices.push(index);
                }

                this.setState({
                    isDrawing: true,
                    drawnIndices: copiedIndices
                });
                // clear the timer
                clearTimeout(timer);
                // notify owner of change
                this.props.onDragMove(index);
            }
        }
    }

    render() {
        const {classes, row, index, color} = this.props;
        let cls = classes.pixel;
        let style = {};

        if (index % 2 === 0 && row % 2 === 0) {
            cls += ` ${classes.even}`;
        } else if (index % 2 !== 0 && row % 2 !== 0) {
            cls += ` ${classes.even}`;
        } else {
            cls += ` ${classes.odd}`;
        }

        if (color) {
            style = {backgroundColor: '#' + color};
        }

        return (
            <GridListTile
                id={`pixel-${index}`}
                className={cls}
                style={style}
                onTouchStart={this.onTouchStart.bind(this)}
                onTouchEnd={this.onTouchEnd.bind(this)}
                onTouchMove={this.onTouchMove.bind(this)} />
        );
    }
}

Pixel.propTypes = {
    classes: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    row: PropTypes.number.isRequired,
    onTap: PropTypes.func.isRequired,
    onPressAndHold: PropTypes.func.isRequired,
    onDragMove: PropTypes.func.isRequired
};

export default withStyles(styles)(Pixel);