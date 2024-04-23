import { StyleSheet } from 'react-native';
import { View } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

export default function ScenesScreen() {
    const theme = useTheme();
    const { background, onBackground } = theme.colors;

    return (
        <View style={{ ...styles.container, backgroundColor: background }}>
            <View style={{ flexDirection: 'row' }}>
                <Feather name="moon" size={24} color={onBackground} style={{ marginRight: 16 }} />
                <Text variant='titleLarge'>Scenes Screen</Text>
            </View>
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
