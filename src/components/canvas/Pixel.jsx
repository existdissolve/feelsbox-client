import {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import {GridListTile} from '@material-ui/core';
import {includes, isNil} from 'lodash';

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
    },
    break: {
        flexBasis: '100%',
        height: 0
    }
};

let timer;

class Pixel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isDrawing: false,
            drawnIndices: []
        };
    }

    onTouchStart = () => {
        const {onPressAndHold, index} = this.props;

        if (!onPressAndHold) {
            return false;
        }

        timer = setTimeout(() => {
            clearTimeout(timer);
            timer = null;
            onPressAndHold(index);
        }, 500);
    };

    onTouchEnd = () => {
        const {onTap, index} = this.props;
        const {drawnIndices, isDrawing} = this.state;

        if (!onTap || (!timer && !isDrawing)) {
            return false;
        }

        this.setState({
            isDrawing: false,
            drawnIndices: []
        });

        clearTimeout(timer);
        onTap(index, drawnIndices);
    };

    onTouchMove = e => {
        const {onDragMove} = this.props;
        const {touches} = e;
        const [touch] = touches;

        if (!onDragMove) {
            return false;
        }

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
                onDragMove(index);
            }
        }
    };

    render() {
        const {classes, row, index, isPanorama, panoramaHeight, panoramaWidth, selectionBox, height, color, width} = this.props;
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

        if (isPanorama) {
            const maxHeight = (panoramaHeight - 20) / height;
            const maxWidth = (panoramaWidth - 20) / width;
            const size = Math.min(maxHeight, maxWidth);
            const borderStyle = 'solid 1px #fff';
            const fn = idx => idx === index;
            const isTop = selectionBox.top.find(fn);
            const isRight = selectionBox.right.find(fn);
            const isBottom = selectionBox.bottom.find(fn);
            const isLeft = selectionBox.left.find(fn);

            style.flex = 'inherit';
            style.width = size;
            style.height = size;

            if (!isNil(isTop)) {
                style.borderTop = borderStyle;
            }

            if (!isNil(isRight)) {
                style.borderRight = borderStyle;
            }

            if (!isNil(isBottom)) {
                style.borderBottom = borderStyle;
            }

            if (!isNil(isLeft)) {
                style.borderLeft = borderStyle;
            }

            if (index !== 0 && index % width === width - 1 ) {
                return (
                    <li className={classes.break} />
                );
            }
        }

        return (
            <GridListTile
                id={`pixel-${index}`}
                className={cls}
                style={style}
                onTouchStart={this.onTouchStart}
                onTouchEnd={this.onTouchEnd}
                onTouchMove={this.onTouchMove} />
        );
    }
}

Pixel.propTypes = {
    classes: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    row: PropTypes.number.isRequired
};

export default withStyles(styles)(Pixel);