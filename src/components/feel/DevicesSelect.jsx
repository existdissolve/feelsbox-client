import {Component} from 'react';
import {graphql} from 'react-apollo';
import {compose} from 'recompose';
import {get} from 'lodash';
import {
    Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup,
    Typography
} from '@material-ui/core';

import {getDevices} from '-/graphql/device';
import {getDeviceGroups} from '-/graphql/deviceGroup';

class DevicesSelect extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedDevices: [],
            selectedDeviceGroups: []
        };
    }

    onCheck = (type, e) => {
        const {onDeviceCheck, onDeviceGroupCheck} = this.props;
        const key = type === 'device' ? 'selectedDevices' : 'selectedDeviceGroups';
        const {[key]: selections} = this.state;
        const items = selections.slice();
        const {target} = e;
        const {checked, name} = target;

        if (checked) {
            items.push(name);
        } else {
            const index = items.findIndex(item => item === name);

            if (index !== -1) {
                items.splice(index, 1);
            }
        }

        this.setState({[key]: items});

        if (type === 'deviceGroup') {
            onDeviceGroupCheck(items);
        } else if (type === 'device') {
            onDeviceCheck(items);
        }
    };

    render() {
        const {selectedDevices, selectedDeviceGroups} = this.state;
        const {messageCapable} = this.props;
        let devices = get(this.props, 'data_devices.devices') || [];
        let deviceGroups = get(this.props, 'data_deviceGroups.deviceGroups') || [];

        if (messageCapable) {
            devices = devices.slice().filter(device => get(device, 'capabilities.messages'));
            deviceGroups = deviceGroups.slice().filter(group => group.devices.every(device => get(device, 'capabilities.messages')));
        }

        return (
            <FormControl component="fieldset">
                {deviceGroups.length !== 0 &&
                    <FormGroup>
                        <Typography variant="h6">Device Groups</Typography>
                        {deviceGroups.map(deviceGroup => {
                            const {_id: deviceGroupId, name} = deviceGroup;
                            const isChecked = selectedDeviceGroups.includes(deviceGroupId);

                            return (
                                <FormControlLabel
                                    key={deviceGroupId}
                                    control={
                                        <Checkbox
                                            checked={isChecked}
                                            onChange={this.onCheck.bind(this, 'deviceGroup')}
                                            name={deviceGroupId} />
                                    }
                                    label={name} />
                            );
                        })}
                    </FormGroup>
                }
                {devices.length !== 0 &&
                    <FormGroup>
                        <Typography variant="h6">Devices</Typography>
                        {devices.map(device => {
                            const {_id: deviceId, name} = device;
                            const isChecked = selectedDevices.includes(deviceId);

                            return (
                                <FormControlLabel
                                    key={deviceId}
                                    control={
                                        <Checkbox
                                            checked={isChecked}
                                            onChange={this.onCheck.bind(this, 'device')}
                                            name={deviceId} />
                                    }
                                    label={name} />
                            );
                        })}
                    </FormGroup>
                }
            </FormControl>
        );
    }
}

export default compose(
    graphql(getDevices, {
        name: 'data_devices',
        options: {
            notifyOnNetworkStatusChange: true
        }
    }),
    graphql(getDeviceGroups, {
        name: 'data_deviceGroups',
        options: {
            notifyOnNetworkStatusChange: true
        }
    })
)(DevicesSelect);
