import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from 'material-ui/styles';
import GridList, {GridListTile} from 'material-ui/GridList';
import Subheader from 'material-ui/List/ListSubheader';

import Emoji from '-/components/emoji/Emoji';

const categoryLabels = {
    food: 'Food',
    drink: 'Drink',
    event: 'Holidays and Events',
    misc: 'Miscellaneous'
};

const styles = theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        backgroundColor: theme.palette.background.paper
    }
});

class EmojiGrid extends React.Component {
    render() {
        const {classes, data, category} = this.props;

        return (
            <div className={classes.root}>
                <GridList cols={3} cellHeight={64}>
                    <GridListTile key="Subheader" cols={3} style={{ height: 'auto' }}>
                        <Subheader component="div">{categoryLabels[category]}</Subheader>
                    </GridListTile>
                    {Object.keys(data).map(key => {
                        const tile = data[key];

                        return <Emoji pixels={tile.pixels} name={key} key={key} />
                    })}
                </GridList>
            </div>
        );
    }
}

EmojiGrid.propTypes = {
    classes: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    category: PropTypes.string.isRequired
};

export default withStyles(styles)(EmojiGrid);