import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { EvilIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { FontAwesome6 } from '@expo/vector-icons';

import { subscribe } from '@/lib/mediator';
import { UserRole, UserRoleStrings, MqttConnectionState } from '@/lib/defines';
import { getLoggedUser } from '@/lib/utils';

const SIDE_MARGINS = 12;


export default function HomeAvatar() {
    const theme = useTheme();
    const { background, onBackground } = theme.colors;
    const [userDispName, setUserDsipName] = useState('John Doe');
    const [avatarString, setAvatarString] = useState("Admin | John's Home");
    const [topBarLabel, setTopBarLabel] = useState('House Rooms');
    const [mqttState, setMqttState] = useState(MqttConnectionState.CONNECTING);

    useEffect(() => {
        subscribe('changeTopBarLabel', 'changeTopBarLabel', args => {
            const newLabel: string = args.newLabel;
            setTopBarLabel(newLabel);
        });
        subscribe('changeMqttState', 'changeMqttState', args => {
            const newMqttState: MqttConnectionState = args.newMqttState;
            setMqttState(newMqttState);
        });

        const loggedUserResult = getLoggedUser();
        if (loggedUserResult.error)
            return;
        const loggedUser = loggedUserResult.success;
        setUserDsipName(loggedUser.display_name);
        const userRole: UserRole = loggedUser.role;
        setAvatarString(`${UserRoleStrings[userRole]} | ${loggedUser.display_name.split(' ')[0]}'s Home`);
    }, []);

    return (
        <View style={{ ...styles.container, backgroundColor: background }}>
            <Text variant='titleLarge' style={{ marginLeft: SIDE_MARGINS }}>{topBarLabel}</Text>
            <View style={styles.avatarCont}>
                <EvilIcons color={onBackground} name='user' size={50} />
                <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text variant='titleMedium' style={{ marginRight: 8 }}>{userDispName}</Text>
                        <FontAwesome6 name='link' color={mqttState} size={16} />
                    </View>
                    <Text variant='labelMedium'>{avatarString}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 24,
        paddingBottom: 8,
        height: 'auto',
        width: '100%',
        backgroundColor: 'red',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        borderBottomWidth: 1,
    },
    avatarCont: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: SIDE_MARGINS,
    },
});