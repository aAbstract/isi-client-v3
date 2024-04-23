import { make_axios_request } from "./api_utils";
import { Result, ISI_SERVER_API_URL } from "@/lib/defines";

export async function getRooms(): Promise<Result> {
    return await make_axios_request({
        method: 'post',
        url: `${ISI_SERVER_API_URL}/user/rooms/get-rooms`,
    });
}