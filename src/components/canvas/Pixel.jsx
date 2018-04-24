import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from 'material-ui/styles';
import {GridListTile} from 'material-ui/GridList';

const styles = {
    pixel: {
        width: 42,
        height: 42
    },
    even: {
        backgroundColor: '#dadada'
    },
    odd: {}
};

class Pixel extends React.Component {
    onClick(emoji) {

    }

    render() {
        const {classes, row, index} = this.props;
        let cls = classes.pixel;

        if (index % 2 === 0 && row % 2 === 0) {
            cls += ` ${classes.even}`;
        } else if (index % 2 !== 0 && row % 2 !== 0) {
            cls += ` ${classes.even}`;
        }

        return (
            <GridListTile className={cls}>

            </GridListTile>
        );
    }
}

Pixel.propTypes = {
    classes: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    row: PropTypes.number.isRequired
};

export default withStyles(styles)(Pixel);