import { make_axios_request } from "./api_utils";
import { Result, ISI_SERVER_API_URL } from "@/lib/defines";

export async function getRoomDevices(roomName: string): Promise<Result> {
    return await make_axios_request({
        method: 'post',
        url: `${ISI_SERVER_API_URL}/user/devices/get-room-devices`,
        data: { room_name: roomName },
    });
}

export async function getTempHumdDevices(): Promise<Result> {
    return await make_axios_request({
        method: 'post',
        url: `${ISI_SERVER_API_URL}/user/devices/get-temp-humd-devices`,
    });
}

export async function changeDeviceConfig(deviceName: string, configName: string, configNewVal: boolean): Promise<Result> {
    return await make_axios_request({
        method: 'post',
        url: `${ISI_SERVER_API_URL}/user/devices/change-device-config`,
        data: {
            device_name: deviceName,
            config_name: configName,
            config_new_val: configNewVal,
        },
    });
}