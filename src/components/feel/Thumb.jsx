import {Component, Fragment} from 'react';
import {get, isEqual} from 'lodash';
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

class Thumb extends Component {
    constructor(props) {
        super(props);

        this.timer;
        this.isDragging = false;
    }

    shouldComponentUpdate(nextProps, nextState) {
        const sameProps = isEqual(nextProps, this.props);
        const sameState = isEqual(nextState, this.state);

        if (sameProps && sameState) {
            return false;
        }

        return true;
    }

    onTouchEnd = () => {
        const {selectionMode, tapHandler} = this.props;
        const _id = get(this.props, 'feel._id');

        if (!selectionMode) {
            if (!this.timer) {
                return false;
            }

            if (this.isDragging) {
                this.isDragging = false;
                return false;
            }

            clearTimeout(this.timer);
        }

        if (typeof tapHandler === 'function') {
            tapHandler(_id);
        }
    };

    onTouchMove = () => {
        const {selectionMode} = this.props;

        if (selectionMode) {
            return false;
        }

        clearTimeout(this.timer);

        this.isDragging = true;
    };

    onTouchStart = e => {
        const {feel, menuOpenHandler, selectionMode} = this.props;
        const {currentTarget} = e;

        if (selectionMode) {
            return false;
        }

        this.timer = setTimeout(() => {
            clearTimeout(this.timer);

            this.timer = null;

            if (typeof menuOpenHandler === 'function') {
                menuOpenHandler(currentTarget, feel);
            }
        }, 500);
    };

    render() {
        const {classes, displayMode = 'grid', feel, isSelected} = this.props;
        const {_id, frames = [], isSubscribed} = feel;
        const frame = frames.find(frame => frame.isThumb) || frames[0];
        const {pixels} = frame;
        const grid = new Array(64).fill(true);
        const height = displayMode === 'grid' ? 8 : 5;
        const width = displayMode === 'grid' ? 8 : 5;
        const emojiCls = classnames({
            ...displayMode === 'grid' && {
                [classes.emoji]: !isSelected,
                [classes.emoji_selected]: isSelected,
                isSubscribed
            },
            ...displayMode === 'list' && {
                [classes.listEmoji]: !isSelected,
                [classes.listEmoji_selected]: isSelected
            }
        });
        const tileStyle = {
            ...displayMode === 'grid' && {
                width: '33%'
            }
        };

        return (
            <Fragment>
                <GridListTile style={tileStyle}>
                    <div>
                        <a id={_id} className={emojiCls} onTouchStart={this.onTouchStart} onTouchEnd={this.onTouchEnd} onTouchMove={this.onTouchMove}>
                            <GridList className={classes.gridList} cols={8} spacing={0} cellHeight={height}>
                                {grid.map((val, idx) => {
                                    let color = '000000';

                                    const pixel = pixels.find(pixel => pixel.position === idx);

                                    if (pixel) {
                                        ({color} = pixel);
                                    }

                                    return <div key={`${_id}-${idx}`} style={{width, backgroundColor: `#${color}`}} />;
                                })}
                            </GridList>
                        </a>
                    </div>
                </GridListTile>

            </Fragment>
        );
    }
}

export default withStyles(styles)(Thumb);
