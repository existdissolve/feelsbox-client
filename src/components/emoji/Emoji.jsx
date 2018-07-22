import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {withStyles} from 'material-ui/styles';
import {withRouter} from 'react-router-dom';
import GridList, {GridListTile} from 'material-ui/GridList';

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
    gridList: {
        width: 64,
        height: 64
    }
};

class Emoji extends React.Component {
    constructor(props) {
        super(props);

        this.timer;
        this.isDragging = false;
    }

    onTouchStart() {
        const {name, category} = this.props;

        this.timer = setTimeout(() => {
            clearTimeout(this.timer);
            this.timer = null;
            this.props.history.push(`/canvas/${category}/${name}`);
        }, 500);
    }

    onTouchEnd() {
        const {name, category} = this.props;

        if (!this.timer) {
            return false;
        }

        if (this.isDragging) {
            this.isDragging = false;
            return false;
        }

        clearTimeout(this.timer);
        this.onTap(name);
    }

    onTap(emoji) {
        axios.get(`https://feelsbox-server.herokuapp.com/emote/${emoji}`)
            .catch(error => {
                console.log(error);
            });
    }

    onTouchMove(e) {
        clearTimeout(this.timer);

        this.isDragging = true;
    }

    render() {
        const {classes, pixels, name} = this.props;
        const grid = new Array(64).fill(true);

        return (
            <GridListTile style={{width: '33%'}}>
                <div>
                    <a id={name} className={classes.emoji} onTouchStart={this.onTouchStart.bind(this)} onTouchEnd={this.onTouchEnd.bind(this)} onTouchMove={this.onTouchMove.bind(this)}>
                        <GridList className={classes.gridList} cols={8} spacing={0} cellHeight={8}>
                            {grid.map((val, index) => {
                                const num = index + 1;
                                let bgColor = '000000';

                                if (pixels[num]) {
                                    bgColor = pixels[num].c;
                                }

                                return <GridListTile key={`${name}-${num}`} style={{width: '8px', backgroundColor: `#${bgColor}`}} />
                            })}
                        </GridList>
                    </a>
                </div>
            </GridListTile>
        );
    }
}

Emoji.propTypes = {
    classes: PropTypes.object.isRequired,
    pixels: PropTypes.any.isRequired,
    name: PropTypes.string.isRequired
};

export default withRouter(withStyles(styles)(Emoji));