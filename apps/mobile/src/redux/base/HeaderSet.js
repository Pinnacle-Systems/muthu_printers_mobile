
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export async function SetHeader(headers, options = {}) {
  const { isLoginRequest = false, method = 'GET' } = options;

  try {
    headers.set('Accept', 'application/json, */*');

    if (method === 'GET' || method === 'HEAD') {
      headers.set('Accept-Encoding', 'gzip, deflate, br');
    }

    headers.set('Accept-Language', 'en-US,en;q=0.9');
    headers.set('X-Platform', Platform.OS);
    headers.set('X-Platform-Version', Platform.Version?.toString() || 'unknown');

    try {
      const [appVersion, appName] = await Promise.all([
        DeviceInfo.getVersion().catch(() => '1.0'),
        DeviceInfo.getApplicationName().catch(() => 'MGI'),
      ]);
      headers.set('X-App-Name', appName);
      headers.set('X-App-Version', appVersion);
    } catch (_) {
      headers.set('X-App-Name', 'MUDHU');
      headers.set('X-App-Version', '1.0');
    }

    try {
      const deviceId = await DeviceInfo.getUniqueId().catch(() => 'unknown');
      headers.set('x-device-id', deviceId);
    } catch (_) {}

    try {
      const net = await NetInfo.fetch();
      headers.set('X-Network-Type', net.type || 'unknown');
    } catch (_) {
      headers.set('X-Network-Type', 'unknown');
    }

    headers.set('X-Request-ID', Date.now() + '-' + Math.random().toString(36).substr(2, 9));
    headers.set('X-Request-Timestamp', Date.now().toString());

    if (!isLoginRequest) {
      try {
        // const stored = await AsyncStorage.getItem('userName');
        // if (stored) {
        //   const user = JSON.parse(stored);
        //   if (user?.GCOMPCODE) headers.set('X-Comp-Code', user.GCOMPCODE);
        //   if (user?.userName)  headers.set('X-User-Ref', user.userName);
        //   if (user?.Id)        headers.set('X-Client-Ref', user.Id);
        // }
      } catch (_) {}
    }

  } catch (error) {
    console.error('[SetHeader] Critical error:', error);
    headers.set('Accept', 'application/json');
    headers.set('X-Platform', Platform.OS);
    headers.set('X-Request-Timestamp', Date.now().toString());
  }

  return headers;
}

export async function getLoginHeaders() {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  await SetHeader(headers, { isLoginRequest: true, method: 'POST' });
  return headers;
}

export async function getApiHeaders(method = 'GET') {
  const headers = new Headers();
  if (method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }
  await SetHeader(headers, { method });
  return headers;
}

export function setupNetworkListener(onNetworkChange) {
  return NetInfo.addEventListener(state => {
    if (onNetworkChange) {
      onNetworkChange({
        type: state.type,
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
      });
    }
  });
}