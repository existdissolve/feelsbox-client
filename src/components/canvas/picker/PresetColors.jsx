import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';

import {Swatch} from 'react-color/lib/components/common';

const styles = () => ({
    root: {
        display: 'flex'
    },
    colors: {
        margin: '0 -10px',
        padding: '6px 0 0 10px',
        borderTop: '1px solid #333',
        display: 'flex',
        flexDirection: 'row',
        flexFlow: 'row wrap',
        alignItems: 'stretch',
        alignContent: 'flex-start',
        position: 'relative'
    },
    swatchWrap: {
        flex: '1 1 0px',
        margin: '0 8px 8px 0',
        '&::after': {
            content: '""',
            display: 'block',
            paddingBottom: '100%'
        }
    },
    breakRow: {
        flexBasis: '100vw'
    }
});

class PresetColors extends React.Component {
    handleClick = (hex, e) => {
        const {onClick = () => {}} = this.props;

        onClick({hex, source: 'hex'}, e);
    };

    render() {
        const {classes, colors, onSwatchHover} = this.props;
        const fillCount = colors.length === 10 ? 0 : 10 - (colors.length % 10);
        const empties = new Array(fillCount);

        empties.fill('');

        return (
            <div className={`flexbox-fix ${classes.colors}`}>
                {colors.map((colorObjOrString, idx) => {
                    const c = typeof colorObjOrString === 'string'
                        ? {color: colorObjOrString}
                        : colorObjOrString;
                    const key = `${c.color}${c.title || ''}`;
                    const breakRow = idx !== 0 && idx % 10 === 0;

                    return (
                        <React.Fragment key={key}>
                            {breakRow && <div key={`break-${idx}`} className={classes.breakRow} />}
                            <div className={classes.swatchWrap}>
                                <Swatch
                                    {...c}
                                    className={classes.swatch}
                                    onClick={this.handleClick}
                                    onHover={onSwatchHover}
                                    focusStyle={{
                                        boxShadow: `inset 0 0 0 1px rgba(0,0,0,.15), 0 0 4px ${c.color}`
                                    }}
                                />
                            </div>
                        </React.Fragment>
                    );
                })}
                {empties.map((item, idx) => {
                    return (
                        <div className={classes.swatchWrap} key={`empty-${idx}`}>
                            <div className={classes.swatch} />
                        </div>
                    );
                })}
            </div>
        );
    }
}

PresetColors.propTypes = {
    colors: PropTypes.arrayOf(PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
            color: PropTypes.string,
            title: PropTypes.string
        })]
    )).isRequired
};

export default withStyles(styles)(PresetColors);
