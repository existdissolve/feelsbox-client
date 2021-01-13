import {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {get, isEqual} from 'lodash';
import classnames from 'classnames';

import {withStyles} from '@material-ui/core/styles';
import {withRouter} from 'react-router-dom';

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
    listEmoji: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        width: 50,
        height: 50,
        margin: '10px 10px 10px 2px',
        padding: 5,
        boxShadow: '0px 1px 5px 0px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.2), 0px 3px 1px -2px rgba(0, 0, 0, 0.2)',
        '&:active': {
            background: '#3f51b5'
        }
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

    onTouchStart = e => {
        const {feel, menuOpenHandler} = this.props;
        const {currentTarget} = e;

        this.timer = setTimeout(() => {
            clearTimeout(this.timer);

            this.timer = null;

            if (typeof menuOpenHandler === 'function') {
                menuOpenHandler(currentTarget, feel);
            }
        }, 500);
    };

    onTouchEnd = () => {
        const {tapHandler} = this.props;
        const _id = get(this.props, 'feel._id');

        if (!this.timer) {
            return false;
        }

        if (this.isDragging) {
            this.isDragging = false;
            return false;
        }

        clearTimeout(this.timer);

        tapHandler(_id);
    };

    onTouchMove = () => {
        clearTimeout(this.timer);

        this.isDragging = true;
    };

    render() {
        const {classes, displayMode = 'grid', feel} = this.props;
        const {frames = [], isSubscribed, name} = feel;
        const frame = frames.find(frame => frame.isThumb) || frames[0];
        const {pixels} = frame;
        const grid = new Array(64).fill(true);
        const emojiCls = classnames(classes.emoji, {
            [classes.emoji]: displayMode === 'grid',
            [classes.listEmoji]: displayMode === 'list',
            isSubscribed
        });
        const tileStyle = {
            ...displayMode === 'grid' && {
                width: '33%'
            }
        };
        const height = displayMode === 'grid' ? 8 : 5;
        const width = displayMode === 'grid' ? 8 : 5;

        return (
            <Fragment>
                <GridListTile style={tileStyle}>
                    <div>
                        <a id={name} className={emojiCls} onTouchStart={this.onTouchStart} onTouchEnd={this.onTouchEnd} onTouchMove={this.onTouchMove}>
                            <GridList className={classes.gridList} cols={8} spacing={0} cellHeight={height}>
                                {grid.map((val, idx) => {
                                    let color = '000000';

                                    const pixel = pixels.find(pixel => pixel.position === idx);

                                    if (pixel) {
                                        ({color} = pixel);
                                    }

                                    return <div key={`${name}-${idx}`} style={{width, backgroundColor: `#${color}`}} />;
                                })}
                            </GridList>
                        </a>
                    </div>
                </GridListTile>

            </Fragment>
        );
    }
}

Thumb.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withRouter(
    withStyles(styles)(Thumb)
);