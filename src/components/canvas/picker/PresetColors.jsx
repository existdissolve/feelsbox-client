import {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';

import {Swatch} from 'react-color/lib/components/common';

const styles = () => ({
    root: {
        //display: 'flex'
    },
    colors: {
        padding: '0px 20px 0 10px',
        flexDirection: 'column',
        overflowY: 'auto'
    },
    swatchWrap: {
        flex: '1 1 0px',
        marginBottom: 5,
        '& span': {
            width: 30,
            height: 30,
            display: 'block'
        }
    },
    breakRow: {
        flexBasis: '100vw'
    },
    swatch: {
        flex: 1
    }
});

class PresetColors extends Component {
    handleClick = (hex, e) => {
        const {onClick = () => {}} = this.props;

        onClick({hex, source: 'hex'}, e);
    };

    render() {
        const {classes, colors, onSwatchHover} = this.props;

        return (
            <div className={`flexbox-fix ${classes.colors}`}>
                {colors.map((colorObjOrString) => {
                    const c = typeof colorObjOrString === 'string'
                        ? {color: colorObjOrString}
                        : colorObjOrString;
                    const key = `${c.color}${c.title || ''}`;

                    return (
                        <Fragment key={key}>
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
                        </Fragment>
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
