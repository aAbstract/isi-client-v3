import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { View, ScrollView } from 'react-native';
import { ActivityIndicator, useTheme, Text } from 'react-native-paper';

import RoomCard from '@/components/home/RoomCard';
import { getRooms } from '@/api/rooms';
import { Room, ISI_SERVER_ADDR, ISI_SERVER_MQTT_WS_PORT, MqttConnectionState } from '@/lib/defines';
import { mqtt_connect, attach_mqtt_notifs_service, attach_client_lwt_handler, attach_global_sensors } from '@/lib/mqtt';
import { post_event } from '@/lib/mediator';

function handleMqttNotifMsg(notif_msg: string) {
    try {
        const mqttNotifMsg = JSON.parse(notif_msg);
        post_event('showSnackBar', mqttNotifMsg);
    } catch (_) { return; }
}

export default function HomeScreen() {
    const theme = useTheme();
    const { background, primary, error } = theme.colors;
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    function computeGlobalSensorList(_rooms: Room[]): string[] {
        const gsList = _rooms.map(x => x.global_sensors_list);
        return gsList.flat();
    }

    useEffect(() => {
        getRooms().then(res => {
            setIsLoading(false);
            if (res.error) {
                setErrorMsg(res.error);
                return;
            }
            const resRooms: Room[] = res.success;
            setRooms(resRooms);

            mqtt_connect(
                ISI_SERVER_ADDR,
                ISI_SERVER_MQTT_WS_PORT,
                'isi_muser',
                'oE74zxUFEY35JX5ffyx4zUZTSauYS2zCFVhvL6gZe5bsBCQo3tP2pCS5VrH98mvX',
                () => {
                    post_event('changeMqttState', { newMqttState: MqttConnectionState.CONNECTED });
                    attach_mqtt_notifs_service((_, notif_msg) => handleMqttNotifMsg(notif_msg));
                    attach_client_lwt_handler();
                    attach_global_sensors(computeGlobalSensorList(resRooms));
                },
                () => {
                    post_event('changeMqttState', { newMqttState: MqttConnectionState.DISCONNECTED });
                },
            );
        });
    }, []);

    return (
        <View style={{ ...styles.container, backgroundColor: background }}>
            <ScrollView style={styles.roomCardsCont}>
                <ActivityIndicator animating={isLoading} color={primary} />
                {errorMsg ? <Text style={{ color: error }}>{errorMsg}</Text> : <></>}
                {rooms ? rooms.map((room, roomIdx) => <RoomCard
                    key={roomIdx}
                    roomName={room.room_name}
                    displayName={room.room_disp_name}
                    roomIcon={room.room_icon}
                    globalSensorList={room.global_sensors_list} />) : <></>}
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
    roomCardsCont: {
        width: 'auto',
        paddingTop: 12,
    },
});
