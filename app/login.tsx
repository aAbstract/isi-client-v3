import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';
import { Button } from 'react-native-paper';
import { TextInput, Text, Checkbox, ActivityIndicator } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { router } from 'expo-router';

import { loginUser } from '@/api/auth';
import { cxStore_setItem } from '@/lib/cxStore';

export default function ModalScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const theme = useTheme();
    const { background, secondaryContainer, primary, error } = theme.colors;

    function loginUserBtnClick() {
        if (!username || !password) {
            setErrorMsg('Required Username and Password');
            return;
        }

        setIsLoading(true);
        loginUser(username, password).then(resp => {
            setIsLoading(false);
            if (resp.error) {
                setErrorMsg(resp.error);
                return;
            }

            const accessToken: string = resp.success.access_token;
            cxStore_setItem('accessToken', accessToken);
            router.navigate({ pathname: "/home" });
        });
    }

    return (
        <View style={{ ...styles.container, backgroundColor: secondaryContainer }}>
            <View style={{ ...styles.loginFormCont, backgroundColor: background }}>
                <Text style={styles.loginText} variant='titleMedium'>ISI Smart Home Login</Text>
                <TextInput label="Username" mode="outlined" value={username}
                    onChangeText={text => setUsername(text)} style={styles.loginTextField}
                    right={<TextInput.Icon icon="account" />} />
                <TextInput secureTextEntry={true} label="Password" mode="outlined" value={password}
                    onChangeText={text => setPassword(text)} style={styles.loginTextField}
                    right={<TextInput.Icon icon="lock" />} />

                <View style={styles.rememMeCont}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Checkbox status='unchecked' />
                        <Text variant='titleSmall'>Remember Me</Text>
                    </View>
                    <Text style={{ color: primary, fontWeight: 'bold' }}>Forgot Password</Text>
                </View>

                <ActivityIndicator animating={isLoading} color={primary} />
                {errorMsg ? <Text style={{ color: error }}>{errorMsg}</Text> : <></>}
                <Button style={styles.loginBtn} icon="lock" mode="elevated" onPress={loginUserBtnClick}>
                    Login
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    loginFormCont: {
        width: '90%',
        alignItems: 'center',
        paddingTop: 16,
        borderRadius: 16,
        marginTop: -16,
        height: '40%',
    },

    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    loginTextField: {
        width: '80%',
        marginBottom: 8,
    },

    loginBtn: {
        width: '50%',
        marginTop: 16,
    },

    loginText: {
        marginBottom: 16,
    },

    rememMeCont: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        alignItems: 'center',
    },
});
