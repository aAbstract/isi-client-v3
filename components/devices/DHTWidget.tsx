import { View, StyleSheet } from "react-native";
import { Text, useTheme, IconButton } from "react-native-paper";
import { FontAwesome6 } from "@expo/vector-icons";

interface DHTWidgetProps {
    tempVal: string,
    humdVal: string,
};

function DHTWIconInfo(iconColor: string, iconBg: string, iconName: string, label: string, value: string) {
    return (
        <View style={styles.iconInfoContainer}>
            <View style={{ ...styles.iconContainer, backgroundColor: iconBg }}>
                <FontAwesome6 name={iconName} color={iconColor} size={24} />
            </View>
            <View style={styles.iconInfoTextContainer}>
                <Text variant="titleLarge">{value}</Text>
                <Text variant="titleSmall">{label}</Text>
            </View>
        </View>
    );
}

export default function DHTWidget({ tempVal, humdVal }: DHTWidgetProps) {
    const theme = useTheme();
    const { background, secondaryContainer, onBackground } = theme.colors;

    function roomPowerOff() { }

    return (
        <View style={{ ...styles.container, backgroundColor: background }}>
            {DHTWIconInfo(onBackground, secondaryContainer, 'temperature-quarter', 'Temperature', tempVal)}
            {DHTWIconInfo(onBackground, secondaryContainer, 'droplet', 'Humidity', humdVal)}
            <IconButton onPress={roomPowerOff} icon='power' />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
        marginBottom: 8,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    iconContainer: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
    },
    iconInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconInfoTextContainer: {
        marginLeft: 8,
    },
});