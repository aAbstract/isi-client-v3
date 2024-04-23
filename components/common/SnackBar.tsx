import { useState, useEffect } from "react";
import { View } from "react-native";
import { Snackbar, useTheme, Text, Portal } from "react-native-paper";

import { subscribe } from "@/lib/mediator";
import { MqttNotifMsg } from "@/lib/defines";

export default function SnackBar() {
    const theme = useTheme();
    const { primaryContainer, onBackground, error } = theme.colors;
    const [sbMsg, setSbMsg] = useState('');
    const [sbMsgTitle, setSbMsgTitle] = useState('');
    const [sbVisi, setSbVisi] = useState(false);
    const [duration, setDuration] = useState(3000);
    const [msgLvl, setMsgLvl] = useState('');

    function resetComponentState() {
        setSbMsg('');
        setSbMsgTitle('');
        setSbVisi(false);
        setDuration(3000);
        setMsgLvl('');
    }

    useEffect(() => {
        subscribe('showSnackBar', 'showSnackBar', args => {
            resetComponentState();
            const notifMsg: MqttNotifMsg = args;
            if (!notifMsg.room || !notifMsg.device) {
                setDuration(3000);
            } else {
                setDuration(60000);
                setSbMsgTitle(`Room: ${notifMsg.room}\nDevice: ${notifMsg.device}`);
            }
            setMsgLvl(notifMsg.msg_lvl);
            setSbMsg(notifMsg.msg_body);
            setSbVisi(true);
        });
    }, []);

    return (
        <Portal>
            <Snackbar
                visible={sbVisi}
                onDismiss={() => setSbVisi(false)}
                duration={duration}
                style={{
                    backgroundColor: primaryContainer,
                }}
                action={{
                    label: 'Close',
                    onPress: () => setSbVisi(false),
                    textColor: onBackground,
                }}>
                <View>
                    {sbMsgTitle ? <Text variant="titleSmall">{sbMsgTitle}</Text> : <></>}
                    <Text variant="titleMedium" style={{
                        fontWeight: 'bold',
                        color: msgLvl === 'error' ? error : onBackground,
                    }}>{msgLvl.toUpperCase()}: {sbMsg}</Text>
                </View>
            </Snackbar>
        </Portal>
    );
}