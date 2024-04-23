import { Text, useTheme } from "react-native-paper";
import { View } from "react-native";


export default function IndexScreen() {
    const theme = useTheme();
    const { background } = theme.colors;

    return (
        <View style={{
            backgroundColor: background,
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <Text variant="titleMedium">Index Screen</Text>
        </View>
    );
}