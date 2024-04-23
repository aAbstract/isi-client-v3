export const ISI_SERVER_ADDR = '127.0.0.1';
export const ISI_SERVER_API_URL = `http://${ISI_SERVER_ADDR}:8080/api`;
export const ISI_SERVER_MQTT_WS_PORT = 9001;

export enum UserRole {
    ADMIN = 0,
    USER = 1,
    GUEST = 2,
};

export const UserRoleStrings: { [key in UserRole]: string } = {
    [UserRole.ADMIN]: 'Admin',
    [UserRole.USER]: 'User',
    [UserRole.GUEST]: 'Guest'
};

export interface Result {
    success?: any;
    error?: any;
};

export interface Room {
    id: string,
    room_name: string,
    room_icon: string,
    room_disp_name: string,
    global_sensors_list: string[],
};

export enum DeviceType {
    SWITCH = 'SWITCH',
    HUMD = 'HUMD',
    TEMP = 'TEMP',
    PLUG = 'PLUG',
    RGB = 'RGB',
    SEC_LOCK = 'SEC_LOCK',
    FLOOD = 'FLOOD',
    MOTION = 'MOTION',
    DIMMER = 'DIMMER'
};

export enum DeviceLinkType {
    LIVE = 'LIVE',
    SUSPEND = 'SUSPEND',
};

export interface DeviceConfig {
    config_name: string,
    config_disp_name: string,
    config_val: boolean,
};

export interface Device {
    id: string,
    device_name: string,
    room_name: string,
    device_type: DeviceType,
    link_type: DeviceLinkType,
    device_config: DeviceConfig[],
    is_online: boolean,
};

export enum MqttConnectionState {
    CONNECTING = '#FFAB00',
    CONNECTED = '#64DD17',
    DISCONNECTED = '#DD2C00',
};

export interface MqttNotifMsg {
    msg_lvl: string,
    msg_body: string,
    room?: string,
    device?: string,
};