import {Component, Fragment} from 'react';
import {get} from 'lodash';

import {withStyles} from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';

const styles = {
    emoji: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        width: 80,
        height: 80,
        margin: '10px auto',
        padding: 8,
        boxShadow: '0px 1px 5px 0px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.2), 0px 3px 1px -2px rgba(0, 0, 0, 0.2)',
        '&:active': {
            background: '#3f51b5'
        }
    },
    emoji_selected: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        width: 80,
        height: 80,
        margin: '10px auto',
        padding: 8,
        boxShadow: '0px 1px 5px 0px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.2), 0px 3px 1px -2px rgba(0, 0, 0, 0.2)',
        background: '#3f51b5'
    },
    gridList: {

    }
};

class SimpleThumb extends Component {
    onTouchEnd = () => {
        const {selectionHandler} = this.props;
        const _id = get(this.props, 'feel._id');

        selectionHandler(_id);
    };

    render() {
        const {classes, feel, isSelected} = this.props;
        const {frames = [], name} = feel;
        const frame = frames.find(frame => frame.isThumb) || frames[0];
        const {pixels} = frame;
        const grid = new Array(64).fill(true);

        return (
            <Fragment>
                <GridListTile style={{width: '33%'}}>
                    <div>
                        <a id={name} className={isSelected ? classes.emoji_selected : classes.emoji} onTouchEnd={this.onTouchEnd}>
                            <GridList className={classes.gridList} cols={8} spacing={0} cellHeight={8}>
                                {grid.map((val, idx) => {
                                    let color = '000000';

                                    const pixel = pixels.find(pixel => pixel.position === idx);

                                    if (pixel) {
                                        ({color} = pixel);
                                    }

                                    return <GridListTile key={`${name}-${idx}`} style={{width: '8px', backgroundColor: `#${color}`}} />;
                                })}
                            </GridList>
                        </a>
                    </div>
                </GridListTile>
            </Fragment>
        );
    }
}

export default withStyles(styles)(SimpleThumb);