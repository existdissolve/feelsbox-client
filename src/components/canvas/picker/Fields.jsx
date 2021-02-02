import reactCSS from 'reactcss';
import color from 'react-color/lib/helpers/color';

import {EditableInput} from 'react-color/lib/components/common';

export const Fields = ({onChange, hex}) => {
    const styles = reactCSS({
        'default': {
            fields: {
                display: 'flex',
                paddingTop: '4px',
                flex: '0 0 auto'
            },
            single: {
                flex: '1',
                paddingLeft: '6px'
            },
            double: {
                flex: '2'
            },
            input: {
                width: '97%',
                padding: '4px',
                border: 'solid 1px #dadada',
                fontSize: '11px',
                marginBottom: '6px'
            }
        }
    });

    const handleChange = (val, e) => {
        if (val) {
            color.isValidHex(val) && onChange({
                hex: val,
                source: 'hex'
            }, e);
        }
    };

    return (
        <div style={styles.fields} className="flexbox-fix">
            <div style={styles.double}>
                <EditableInput
                    style={{input: styles.input, label: styles.label}}
                    label=""
                    value={hex.replace('#', '')}
                    onChange={handleChange}
                />
            </div>
        </div>
    );
};

export default Fields;
