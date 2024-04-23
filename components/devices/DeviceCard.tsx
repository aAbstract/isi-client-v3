import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from "react-native";
import { useTheme, Text, Switch, TouchableRipple, IconButton } from 'react-native-paper';
import { FontAwesome6 } from "@expo/vector-icons";

import { DeviceType, MqttNotifMsg, DeviceConfig } from '@/lib/defines';
import { formatDeviceName } from '@/lib/utils';
import { mqtt_publish } from '@/lib/mqtt';
import { post_event } from '@/lib/mediator';
import { changeDeviceConfig } from '@/api/devices';

interface DeviceCardProps {
    deviceName: string,
    deviceType: DeviceType,
    deviceState: string,
    deviceConfig: DeviceConfig[],
};

function createDeviceIcon(color: string, deviceType: DeviceType): React.JSX.Element {
    const ICON_SIZE = 24;
    const DEVICE_ICONS_MAP: Record<DeviceType, React.JSX.Element> = {
        SWITCH: <View style={{ width: ICON_SIZE + 4 }}><FontAwesome6 color={color} name='toggle-off' size={ICON_SIZE} /></View>,
        DIMMER: <View style={{ width: ICON_SIZE + 4 }}><FontAwesome6 color={color} name='sun' size={ICON_SIZE} /></View>,
        FLOOD: <View style={{ width: ICON_SIZE + 4 }}><FontAwesome6 color={color} name='water' size={ICON_SIZE} /></View>,
        HUMD: <View style={{ width: ICON_SIZE + 4 }}><FontAwesome6 color={color} name='droplet' size={ICON_SIZE} /></View>,
        MOTION: <View style={{ width: ICON_SIZE + 4 }}><FontAwesome6 color={color} name='person-running' size={ICON_SIZE} /></View>,
        PLUG: <View style={{ width: ICON_SIZE + 4 }}><FontAwesome6 color={color} name='plug' size={ICON_SIZE} /></View>,
        RGB: <View style={{ width: ICON_SIZE + 4 }}><FontAwesome6 color={color} name='palette' size={ICON_SIZE} /></View>,
        SEC_LOCK: <View style={{ width: ICON_SIZE + 4 }}><FontAwesome6 color={color} name='lock' size={ICON_SIZE} /></View>,
        TEMP: <View style={{ width: ICON_SIZE + 4 }}><FontAwesome6 color={color} name='temperature-quarter' size={ICON_SIZE} /></View>,
    };
    return DEVICE_ICONS_MAP[deviceType];
}

function sendDeviceCommand(deviceName: string, devicePref: string, command: string) {
    const mqttPayload = JSON.stringify({ command });
    if (!mqtt_publish(`command/${deviceName}/${devicePref}`, mqttPayload)) {
        post_event('showSnackBar', {
            msg_lvl: 'error',
            msg_body: 'Can not Reach Devices RTC Network',
        } as MqttNotifMsg);
        return;
    }
    post_event('changeDeviceState', { deviceName, newState: 'LOADING' });
}

function _changeDeviceConfig(deviceName: string, configName: string, configNewVal: boolean) {
    changeDeviceConfig(deviceName, configName, configNewVal).then(res => {
        if (res.error) {
            post_event('showSnackBar', {
                msg_lvl: 'error',
                msg_body: res.error,
            } as MqttNotifMsg);
            return;
        }
        post_event('reloadDevices', {});
    });
}

function createDeviceAdvancedControlWidget(deviceName: string, deviceType: DeviceType, deviceConfig: DeviceConfig[], backgroundColor: string, activeBtnColor: string, deviceState: string): React.JSX.Element {
    const DEVICE_ADVCONT_MAP: Record<DeviceType, React.JSX.Element> = {
        SWITCH: <View style={{ ...styles.advnacedControlsContainer, backgroundColor: backgroundColor }}></View>,
        DIMMER:
            <View style={{ ...styles.advnacedControlsContainer, flexDirection: 'row', justifyContent: 'space-around', backgroundColor: backgroundColor }}>
                <IconButton onPress={() => sendDeviceCommand(deviceName, 'dimmer_0', 'DIM_0')} icon='numeric-0' style={{ borderWidth: 1, backgroundColor: deviceState === '0' ? activeBtnColor : '' }} />
                <IconButton onPress={() => sendDeviceCommand(deviceName, 'dimmer_0', 'DIM_1')} icon='numeric-1' style={{ borderWidth: 1, backgroundColor: deviceState === '35' ? activeBtnColor : '' }} />
                <IconButton onPress={() => sendDeviceCommand(deviceName, 'dimmer_0', 'DIM_2')} icon='numeric-2' style={{ borderWidth: 1, backgroundColor: deviceState === '70' ? activeBtnColor : '' }} />
                <IconButton onPress={() => sendDeviceCommand(deviceName, 'dimmer_0', 'DIM_3')} icon='numeric-3' style={{ borderWidth: 1, backgroundColor: deviceState === '100' ? activeBtnColor : '' }} />
            </View>,
        FLOOD: <View style={{ ...styles.advnacedControlsContainer, backgroundColor: backgroundColor }}></View>,
        HUMD: <View style={{ ...styles.advnacedControlsContainer, backgroundColor: backgroundColor }}></View>,
        MOTION:
            <View style={{ ...styles.advnacedControlsContainer, backgroundColor: backgroundColor }}>
                {deviceConfig.map(x =>
                    <View key={x.config_name} style={{ justifyContent: 'space-between', flexDirection: 'row', marginBottom: 8 }}>
                        <Text>{x.config_disp_name}</Text>
                        <Switch value={x.config_val} onValueChange={() => { _changeDeviceConfig(deviceName, x.config_name, !x.config_val) }} />
                    </View>)}
            </View>,
        PLUG: <View style={{ ...styles.advnacedControlsContainer, backgroundColor: backgroundColor }}></View>,
        RGB: <View style={{ ...styles.advnacedControlsContainer, backgroundColor: backgroundColor }}></View>,
        SEC_LOCK: <View style={{ ...styles.advnacedControlsContainer, backgroundColor: backgroundColor }}></View>,
        TEMP: <View style={{ ...styles.advnacedControlsContainer, backgroundColor: backgroundColor }}></View>,
    };
    return DEVICE_ADVCONT_MAP[deviceType];
}

export default function DeviceCard({ deviceName, deviceType, deviceState, deviceConfig }: DeviceCardProps) {
    const theme = useTheme();
    const { secondaryContainer, primary, onBackground, onSecondary } = theme.colors;
    const [isSwitchOn, setIsSwitchOn] = useState(false);

    function toggleDevicePower() {
        const mqttPayload = JSON.stringify({ command: 'TOGGLE' });
        if (!mqtt_publish(`command/${deviceName}/power_0`, mqttPayload)) {
            post_event('showSnackBar', {
                msg_lvl: 'error',
                msg_body: 'Can not Reach Devices RTC Network',
            } as MqttNotifMsg);
            return;
        }
        post_event('changeDeviceState', { deviceName, newState: 'LOADING' });
        setIsSwitchOn(!isSwitchOn);
    }

    useEffect(() => {
        setIsSwitchOn(!['OFF', 'NONE'].includes(deviceState));
    }, [deviceState]);

    return (
        <View>
            <TouchableRipple onPress={() => { }} rippleColor={primary} style={{ ...styles.touchableRipple, backgroundColor: secondaryContainer }}>
                <View style={styles.deviceCard}>
                    {createDeviceIcon(onBackground, deviceType)}
                    <View style={{ marginLeft: 16, width: 200 }}>
                        <Text variant="titleMedium" >{formatDeviceName(deviceName)}</Text>
                        <Text variant="labelMedium">{deviceState}</Text>
                    </View>
                    <View style={styles.controlsContainer}>
                        <FontAwesome6 color={onBackground} name='link' size={16} />
                        <Switch value={isSwitchOn} onValueChange={toggleDevicePower} style={{ marginLeft: 16 }} />
                    </View>
                </View>
            </TouchableRipple>
            {createDeviceAdvancedControlWidget(deviceName, deviceType, deviceConfig, secondaryContainer, onSecondary, deviceState)}
        </View>
    );
}

const styles = StyleSheet.create({
    deviceCard: {
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 16,
        paddingRight: 16,
    },

    touchableRipple: {
        marginBottom: 16,
        borderTopRightRadius: 8,
        borderTopLeftRadius: 8,
    },

    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },

    advnacedControlsContainer: {
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 8,
        marginTop: -16,
        marginBottom: 16,
        borderBottomRightRadius: 8,
        borderBottomLeftRadius: 8,
    },
});