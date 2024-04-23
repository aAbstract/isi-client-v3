import { Result, UserRole } from './defines';
import { cxStore_getItem } from './cxStore';
import { router } from 'expo-router';
import { decode } from 'js-base64';

export function getLoggedUser(): Result {
    const accessToken = cxStore_getItem('accessToken');
    if (!accessToken)
        return { error: 'Empty Access Token, Login Required' };
    const base64URI = accessToken.split('.')[1];
    const base64 = base64URI.replace('-', '+').replace('_', '/');
    let payload = decodeURIComponent(decode(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const jwtClaims = JSON.parse(payload);
    return { success: jwtClaims };
}

export function authGuard(minAccessLevel: UserRole) {
    setTimeout(() => {
        const loggedUserResult = getLoggedUser();
        if (loggedUserResult.error) {
            router.replace('/login');
            return;
        }

        const userRole: UserRole = loggedUserResult.success.role;
        if (userRole > minAccessLevel) {
            router.replace('/login');
            return;
        }
    }, 1);
}

export function formatDeviceName(deviceName: string): string {
    const CHAR_LIMIT = 16;
    const fmtDeviceName = deviceName.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    if (fmtDeviceName.length > CHAR_LIMIT)
        return fmtDeviceName.substring(0, CHAR_LIMIT) + '...';

    return fmtDeviceName;
}