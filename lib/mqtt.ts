import Paho from 'paho-mqtt';
import { getLoggedUser } from './utils';
import { post_event } from './mediator';
import { UserRole, UserRoleStrings } from './defines';

let client_id = 'NONE';
let client: Paho.Client | null = null;
let subscribers: any = {};

function mqtt_read_handler(msg: Paho.Message) {
    const topics_list = [
        {
            regex: /^telem\/[^/]+\/DEVICE_LWT$/,
            handler_name: 'telem/+/DEVICE_LWT',
        },
        {
            regex: /^state\/[^/]+\/main$/,
            handler_name: 'state/+/main',
        },
        {
            regex: /^telem\/client\/notif$/,
            handler_name: 'telem/client/notif',
        },
        {
            regex: /^telem\/broadcast$/,
            handler_name: 'telem/broadcast',
        },
    ];

    topics_list.forEach((topic_info) => {
        const device_name = msg.destinationName.split('/')[1];
        if (!topic_info.regex.test(msg.destinationName))
            return;
        if (topic_info.handler_name in subscribers)
            subscribers[topic_info.handler_name](device_name, msg.payloadString);
        else
            post_event('updateGlobalSensor', { device_name, payload: msg.payloadString });
    });
}

function makeid(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}


export function mqtt_connect(broker_ip: string, broker_port: number, mqtt_username: string, mqtt_password: string, on_success: () => void, on_failure: () => void) {
    if (client?.isConnected())
        return;

    const { username, role } = getLoggedUser().success as { username: string, role: UserRole };
    client_id = `isi_client.${UserRoleStrings[role]}.${username}-${makeid(8)}`;
    client = new Paho.Client(broker_ip, broker_port, client_id);
    client.connect({
        userName: mqtt_username,
        password: mqtt_password,
        onSuccess: on_success,
        onFailure: on_failure,
    });
    client.onMessageArrived = mqtt_read_handler;
    client.onConnectionLost = on_failure;
}

export function mqtt_disconnect() {
    if (client?.isConnected()) {
        client.onConnectionLost = () => { };
        client.disconnect();
        client = null;
        subscribers = {} as any;
    }
}

export function mqtt_publish(topic: string, payload: string): boolean {
    if (client?.isConnected()) {
        let msg = new Paho.Message(payload);
        msg.destinationName = topic;
        client.send(msg);
        if (topic.split('/')[0] === 'command')
            post_event('mqtt_publish_command', { topic, payload });
        return true;
    }

    return false;
}

export function attach_mqtt_devices_scanner(conn_handler: (device_name: string, payload: string) => void, state_handler: (device_name: string, payload: string) => void) {
    if (client?.isConnected()) {
        mqtt_publish('telem/broadcast', 'DEVICES_SCAN');
        client.subscribe('telem/+/DEVICE_LWT');
        client.subscribe('state/+/main');
        subscribers['telem/+/DEVICE_LWT'] = conn_handler;
        subscribers['state/+/main'] = state_handler;
    }
}

export function detach_mqtt_devices_scanner() {
    if (client?.isConnected()) {
        client.unsubscribe('telem/+/DEVICE_LWT');
        client.unsubscribe('state/+/main');
        delete subscribers['telem/+/DEVICE_LWT'];
        delete subscribers['state/+/main'];
    }
    else { return; }
}

export function attach_mqtt_notifs_service(notifs_handler: (_: string, payload: string) => void) {
    if (client?.isConnected()) {
        client.subscribe('telem/client/notif');
        subscribers['telem/client/notif'] = notifs_handler;
    }
}

export function detach_mqtt_notifs_service() {
    if (client?.isConnected()) {
        client.unsubscribe('telem/client/notif');
        delete subscribers['telem/client/notif'];
    }
    else { return; }
}

export function attach_client_lwt_handler() {
    if (client?.isConnected()) {
        client.subscribe('telem/broadcast');
        subscribers['telem/broadcast'] = (_: string, payload: string) => {
            if (payload !== 'CLIENTS_SCAN')
                return;
            mqtt_publish(`telem/${client_id}/CLIENT_LWT`, 'ONLINE');
        };
    }
}

export function attach_global_sensors(device_name_list: string[]) {
    if (client?.isConnected())
        device_name_list.forEach(device_name => client?.subscribe(`state/${device_name}/main`));
}

export function detach_global_sensors(device_name_list: string[]) {
    if (client?.isConnected())
        device_name_list.forEach(device_name => client?.unsubscribe(`state/${device_name}/main`));
}