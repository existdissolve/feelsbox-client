import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from 'material-ui/styles';
import GridList, {GridListTile} from 'material-ui/GridList';

import AppBar from '-/components/AppBar';
import Pixel from '-/components/canvas/Pixel';

const styles = theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        backgroundColor: theme.palette.background.paper
    },
    gridList: {
        marginTop: '10px !important'
    }
});

class CanvasGrid extends React.Component {
    render() {
        const {classes} = this.props;
        const nodes = Array(64).fill(true)

        return (
            <div>
                <AppBar title="Create Emoji" />
                <div>
                    <GridList className={classes.root} cols={8}>
                        {nodes.map((item, index) => (
                            <Pixel key={index} index={index} row={Math.floor(index / 8)} />
                        ))}
                    </GridList>
                </div>
            </div>
        );
    }
}

CanvasGrid.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CanvasGrid);