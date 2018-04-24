import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {withStyles} from 'material-ui/styles';
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
        boxShadow: '0px 1px 5px 0px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.2), 0px 3px 1px -2px rgba(0, 0, 0, 0.2)'
    },
    gridList: {
        width: 64,
        height: 64
    }
};

class Emoji extends React.Component {
    onClick(emoji) {
        axios.get(`https://feelsbox-server.herokuapp.com/emote/${emoji}`).then(response => {
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    render() {
        const {classes, pixels, name} = this.props;
        const grid = new Array(64).fill(true);

        return (
            <GridListTile style={{width: '33%'}}>
                <div>
                    <a className={classes.emoji} onClick={this.onClick.bind(this, name)}>
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

export default withStyles(styles)(Emoji);