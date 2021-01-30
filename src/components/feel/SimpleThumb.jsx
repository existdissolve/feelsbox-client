import {Component, Fragment} from 'react';
import {get} from 'lodash';
import classnames from 'classnames';

import {withStyles} from '@material-ui/core/styles';
import {GridList, GridListTile} from '@material-ui/core';

const baseEmoji = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    margin: '10px auto',
    padding: 8,
    boxShadow: '0px 1px 5px 0px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.2), 0px 3px 1px -2px rgba(0, 0, 0, 0.2)'
};

const styles = {
    emoji: {
        ...baseEmoji,
        width: 80,
        '&:active': {
            background: '#3f51b5'
        }
    },
    emoji_selected: {
        ...baseEmoji,
        width: 80,
        height: 80,
        background: '#3f51b5'
    },
    listEmoji: {
        ...baseEmoji,
        width: 50,
        height: 50,
        margin: '10px 10px 10px 2px',
        padding: 5,
        '&:active': {
            background: '#3f51b5'
        }
    },
    listEmoji_selected: {
        ...baseEmoji,
        width: 50,
        height: 50,
        margin: '10px 10px 10px 2px',
        padding: 5,
        background: '#3f51b5'
    }
};

class SimpleThumb extends Component {
    onTouchEnd = () => {
        const {selectionHandler} = this.props;
        const _id = get(this.props, 'feel._id');

        selectionHandler(_id);
    };

    render() {
        const {classes, displayMode, feel, isSelected} = this.props;
        const {frames = [], name} = feel;
        const frame = frames.find(frame => frame.isThumb) || frames[0];
        const {pixels} = frame;
        const grid = new Array(64).fill(true);
        const tileStyle = {
            ...displayMode === 'grid' && {
                width: '33%'
            }
        };
        const height = displayMode === 'grid' ? 8 : 5;
        const width = displayMode === 'grid' ? 8 : 5;
        const emojiCls = classnames(classes.emoji, {
            ...displayMode === 'grid' && {
                [classes.emoji]: !isSelected,
                [classes.emoji_selected]: isSelected
            },
            ...displayMode === 'list' && {
                [classes.listEmoji]: !isSelected,
                [classes.listEmoji_selected]: isSelected
            }
        });

        return (
            <Fragment>
                <GridListTile style={tileStyle}>
                    <div>
                        <a id={name} className={emojiCls} onTouchEnd={this.onTouchEnd}>
                            <GridList className={classes.gridList} cols={8} spacing={0} cellHeight={height}>
                                {grid.map((val, idx) => {
                                    let color = '000000';

                                    const pixel = pixels.find(pixel => pixel.position === idx);

                                    if (pixel) {
                                        ({color} = pixel);
                                    }

                                    return (
                                        <div key={`${name}-${idx}`} style={{width, backgroundColor: `#${color}`}} />
                                    );
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