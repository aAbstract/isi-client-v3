import { make_axios_request } from "./api_utils";
import { Result, ISI_SERVER_API_URL } from "@/lib/defines";

export async function loginUser(username: string, password: string): Promise<Result> {
    return await make_axios_request({
        method: 'post',
        url: `${ISI_SERVER_API_URL}/auth/login`,
        headers: { 'content-type': 'multipart/form-data' },
        data: { username, password },
    });
}