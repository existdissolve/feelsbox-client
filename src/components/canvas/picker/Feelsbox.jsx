import React from 'react'
import PropTypes from 'prop-types'
import reactCSS from 'reactcss'

import {CustomPicker} from 'react-color';
import {Saturation, Hue, Alpha, Checkboard} from 'react-color/lib/components/common';
import Fields from './Fields'
import PresetColors from './PresetColors'

export const Feelsbox = props => {
    const {
        width,
        hex,
        rgb,
        hsl,
        hsv,
        onChange,
        onSwatchHover,
        presetColors,
        className
    } = props;

    const styles = reactCSS({
        'default': {
            picker: {
                width,
                padding: '10px 10px 0',
                boxSizing: 'initial',
                background: '#fff'
            },
            saturation: {
                width: '100%',
                paddingBottom: '50%',
                position: 'relative',
                overflow: 'hidden'
            },
            Saturation: {
                radius: '3px',
                shadow: 'inset 0 0 0 1px rgba(0,0,0,.15), inset 0 0 4px rgba(0,0,0,.25)'
            },
            controls: {
                display: 'flex'
            },
            sliders: {
                padding: '4px 0',
                flex: '1'
            },
            color: {
                width: '26px',
                height: '26px',
                position: 'relative',
                marginTop: '4px',
                marginLeft: '4px',
                borderRadius: '3px'
            },
            activeColor: {
                absolute: '0px 0px 0px 0px',
                border: 'solid 1px #dadada',
                background: `rgba(${rgb.r},${rgb.g},${rgb.b},${rgb.a})`
            },
            hue: {
                position: 'relative',
                height: '24px',
                overflow: 'hidden',
                border: 'solid 1px #dadada'
            },
            Hue: {}
        }
    });

    return (
        <div style={styles.picker} className={`sketch-picker ${className}`}>
            <div style={styles.saturation}>
                <Saturation
                    style={styles.Saturation}
                    hsl={hsl}
                    hsv={hsv}
                    onChange={onChange}
                />
            </div>
            <div style={styles.controls} className="flexbox-fix">
                <div style={styles.sliders}>
                    <div style={styles.hue}>
                        <Hue
                            style={styles.Hue}
                            hsl={hsl}
                            onChange={onChange}
                        />
                    </div>
                </div>
                <div style={styles.color}>
                    <Checkboard />
                    <div style={styles.activeColor} />
                </div>
            </div>

            <Fields
                hex={hex}
                onChange={onChange}
            />
            <PresetColors
                colors={presetColors}
                onClick={onChange}
                onSwatchHover={onSwatchHover}
            />
        </div>
    )
}

Feelsbox.propTypes = {
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}

Feelsbox.defaultProps = {
    presetColors: [
        '#D0021B', '#F5A623', '#F8E71C', '#8B572A', '#7ED321', '#417505',
        '#BD10E0', '#9013FE', '#4A90E2', '#50E3C2', '#B8E986', '#000000',
        '#4A4A4A', '#9B9B9B', '#FFFFFF'
    ]
}

export default CustomPicker(Feelsbox);
