import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from 'material-ui/styles';
import {GridListTile} from 'material-ui/GridList';

const styles = {
    pixel: {
        width: 40,
        height: 40
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

        if (!timer) {
            return false;
        }

        clearTimeout(timer);
        onTap(index);
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
                className={cls}
                onTouchStart={this.onTouchStart.bind(this)}
                onTouchEnd={this.onTouchEnd.bind(this)} style={style} />
        );
    }
}

Pixel.propTypes = {
    classes: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    row: PropTypes.number.isRequired,
    onTap: PropTypes.func.isRequired,
    onPressAndHold: PropTypes.func.isRequired
};

export default withStyles(styles)(Pixel);