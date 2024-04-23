import { StyleSheet } from 'react-native';
import { View } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { router } from 'expo-router';

import { cxStore_removeItem } from '@/lib/cxStore';

export default function SettingsScreen() {
    const theme = useTheme();
    const { background, primaryContainer } = theme.colors;

    function logoutBtnClick() {
        cxStore_removeItem('accessToken');
        router.replace('/login');
    }

    return (
        <View style={{ ...styles.container, backgroundColor: background }}>
            <Button mode="elevated" style={{ backgroundColor: primaryContainer, width: 200, }} onPress={logoutBtnClick}>LOGOUT</Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
