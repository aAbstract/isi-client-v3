import axios, { AxiosRequestConfig } from 'axios';
import { Result } from '@/lib/defines';
import { cxStore_getItem } from '@/lib/cxStore';

export async function make_axios_request(axios_request_config: AxiosRequestConfig): Promise<Result> {
    axios_request_config.validateStatus = (status: number) => status < 500;
    const accessToken = cxStore_getItem('accessToken') ?? '';
    const request_headers = axios_request_config.headers ?? {};
    axios_request_config.headers = { ...request_headers, Authorization: `Bearer ${accessToken}` };
    try {
        const axios_request = axios(axios_request_config);
        const axios_response = await axios_request;
        if (axios_response.status !== 200)
            return { error: axios_response.data.detail }
        else
            return { success: axios_response.data };
    } catch (e) {
        const err_obj = e as any;
        return { error: `[ERROR] [${err_obj.code}]: ${err_obj.message}` };
    }
}