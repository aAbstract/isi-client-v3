import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from "react-native";
import { useTheme, Text, Switch, TouchableRipple } from 'react-native-paper';
import { FontAwesome6 } from "@expo/vector-icons";
import { router } from 'expo-router';

import { post_event, subscribe } from '@/lib/mediator';

interface RoomCardProps {
    displayName: string,
    roomIcon: string,
    roomName: string,
    globalSensorList: string[],
};

function createRoomIcon(color: string, roomIcon: string): React.JSX.Element {
    const ICON_SIZE = 24;
    const ROOM_ICONS_MAP: Record<string, React.JSX.Element> = {
        'living_room': <FontAwesome6 color={color} name='couch' size={ICON_SIZE} />,
        'bedroom': <FontAwesome6 color={color} name='bed' size={ICON_SIZE} />,
        'children_room': <FontAwesome6 color={color} name='children' size={ICON_SIZE} />,
        'dining_room': <FontAwesome6 color={color} name='utensils' size={ICON_SIZE} />,
        'kichen': <FontAwesome6 color={color} name='kitchen-set' size={ICON_SIZE} />,
        'gym': <FontAwesome6 color={color} name='dumbbell' size={ICON_SIZE} />,
        'garden': <FontAwesome6 color={color} name='seedling' size={ICON_SIZE} />,
        'office': <FontAwesome6 color={color} name='computer' size={ICON_SIZE} />,
        'tv_room': <FontAwesome6 color={color} name='tv' size={ICON_SIZE} />,
    };
    return ROOM_ICONS_MAP[roomIcon];
}

export default function RoomCard({ displayName, roomIcon, roomName, globalSensorList }: RoomCardProps) {
    const theme = useTheme();
    const { secondaryContainer, primary, onBackground } = theme.colors;
    const [isSwitchOn, setIsSwitchOn] = useState(false);
    const [gsTemp, setGsTemp] = useState('-- C');
    const [gsHumd, setGsHumd] = useState('-- %');

    function roomCardPress() {
        post_event('changeTopBarLabel', { newLabel: displayName });
        router.navigate({ pathname: '/devices', params: { roomName } });
    }

    useEffect(() => {
        subscribe('updateGlobalSensor', `updateGlobalSensorRoomCard_${roomName}`, args => {
            const device_name: string = args.device_name;
            const payload: string = args.payload;
            if (!(globalSensorList.includes(device_name)))
                return;
            if (/[a-z]+_temperature_sensor_[0-9]+/.test(device_name))
                setGsTemp(payload);
            else if (/[a-z]+_humidity_sensor_[0-9]+/.test(device_name))
                setGsHumd(payload);
        });
    }, []);

    return (
        <TouchableRipple onPress={roomCardPress} rippleColor={primary} style={{ ...styles.touchableRipple, backgroundColor: secondaryContainer }}>
            <View style={styles.roomCard}>
                {createRoomIcon(onBackground, roomIcon)}
                <View style={{ marginLeft: 16, width: 200 }}>
                    <Text variant="titleMedium" >{displayName}</Text>
                    <Text variant="labelMedium">{`Temp: ${gsTemp} | Humd: ${gsHumd}`}</Text>
                </View>
                <Switch style={{ marginLeft: 16 }} value={isSwitchOn} onValueChange={() => setIsSwitchOn(!isSwitchOn)} />
            </View>
        </TouchableRipple>
    );
}

const styles = StyleSheet.create({
    roomCard: {
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 16,
        paddingRight: 16,
    },

    touchableRipple: {
        marginBottom: 16,
        borderRadius: 8,
    },
});