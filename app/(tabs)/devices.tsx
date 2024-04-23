import { useEffect, useState, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { View, ScrollView } from 'react-native';
import { Text, useTheme, ActivityIndicator } from "react-native-paper";
import { useGlobalSearchParams } from 'expo-router';

import { getRoomDevices } from '@/api/devices';
import { Device, DeviceType } from '@/lib/defines';
import DeviceCard from '@/components/devices/DeviceCard';
import DHTWidget from '@/components/devices/DHTWidget';
import { attach_mqtt_devices_scanner, detach_mqtt_devices_scanner } from '@/lib/mqtt';
import { subscribe } from '@/lib/mediator';

export default function DevicesScreen() {
    const theme = useTheme();
    const { background, error, primary } = theme.colors;
    const queryParams = useGlobalSearchParams();
    const roomName = queryParams.roomName as string;
    const [devices, setDevices] = useState<Device[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [deviceStateMap, setDeviceStateMap] = useState<any>({});
    const deviceStateMapRef = useRef<any>({});
    const [dhtWidgetTemp, setDhtWidgetTemp] = useState('-- C');
    const [dhtWidgetHumd, setDhtWidgetHumd] = useState('-- %');
    const dhtWidgetDeviceList = useRef<string[]>([]);

    function resetComponentState() {
        setDevices([]);
        setIsLoading(true);
        setErrorMsg('');
        setDeviceStateMap({});
        setDhtWidgetTemp('-- C');
        setDhtWidgetHumd('-- %');
    }

    function computeDeviceStateMap(_devices: Device[]): any {
        let _deviceStateMap: any = {};
        _devices.forEach(device => _deviceStateMap[device.device_name] = 'NONE');
        return _deviceStateMap;
    }

    function computeDhtSensorList(_devices: Device[]): string[] {
        const gsList = _devices.filter(x => (x.device_type === DeviceType.TEMP || x.device_type === DeviceType.HUMD));
        return gsList.map(x => x.device_name);
    }

    useEffect(() => {
        if (!roomName)
            return;
        resetComponentState();
        getRoomDevices(roomName).then(res => {
            setIsLoading(false);
            if (res.error) {
                setErrorMsg(res.error);
                return;
            }
            if (!res.success.length) {
                setErrorMsg('No Devices Found in This Room');
                return;
            }
            const resDevices = res.success;
            setDevices(resDevices);
            deviceStateMapRef.current = computeDeviceStateMap(resDevices);
            setDeviceStateMap(deviceStateMapRef.current);
            dhtWidgetDeviceList.current = computeDhtSensorList(resDevices);

            attach_mqtt_devices_scanner(
                // device connection handler
                (device_name: string, payload: string) => { },

                // device state handler
                (device_name: string, payload: string) => {
                    deviceStateMapRef.current[device_name] = payload;
                    setDeviceStateMap({ ...deviceStateMapRef.current });

                    // update DHTWidget values
                    if (!dhtWidgetDeviceList.current.includes(device_name))
                        return;
                    if (/[a-z]+_temperature_sensor_[0-9]+/.test(device_name))
                        setDhtWidgetTemp(payload);
                    else if (/[a-z]+_humidity_sensor_[0-9]+/.test(device_name))
                        setDhtWidgetHumd(payload);
                },
            );

            subscribe('changeDeviceState', 'changeDeviceState', args => {
                const deviceName: string = args.deviceName;
                const newState: string = args.newState;
                deviceStateMapRef.current[deviceName] = newState;
                setDeviceStateMap({ ...deviceStateMapRef.current });
            });

            subscribe('reloadDevices', 'reloadDevices', _ => {
                getRoomDevices(roomName).then(res => {
                    setIsLoading(false);
                    if (res.error) {
                        setErrorMsg(res.error);
                        return;
                    }
                    if (!res.success.length) {
                        setErrorMsg('No Devices Found in This Room');
                        return;
                    }
                    const resDevices = res.success;
                    setDevices(resDevices);
                });
            });
        });

        return detach_mqtt_devices_scanner
    }, [roomName]);

    return (
        <View style={{ ...styles.container, backgroundColor: background }}>
            <DHTWidget tempVal={dhtWidgetTemp} humdVal={dhtWidgetHumd} />
            <ScrollView style={styles.deviceCardsCont}>
                <ActivityIndicator animating={isLoading} color={primary} />
                {errorMsg ? <Text style={{ color: error }}>{errorMsg}</Text> : <></>}
                {devices.length ? devices.map((device, deviceIdx) => <DeviceCard
                    key={deviceIdx}
                    deviceName={device.device_name}
                    deviceType={device.device_type}
                    deviceState={deviceStateMap[device.device_name]}
                    deviceConfig={device.device_config} />) : <></>}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    deviceCardsCont: {
        width: 'auto',
        paddingTop: 12,
    },
});