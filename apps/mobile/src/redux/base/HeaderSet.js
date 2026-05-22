
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { createMMKV } from '../../Utils/Storage/mmkv';



// ─── Token Store (outside function, created once) ────────────────
const AccessTokenStore  = createMMKV("access_token",  "");
const RefreshTokenStore = createMMKV("refresh_token", "");

// ─── Token Helpers ───────────────────────────────────────────────
export const getAccessToken  = () => AccessTokenStore.get();
export const getRefreshToken = () => RefreshTokenStore.get();

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
        const token = getAccessToken(); // ← read from MMKV

        if (token) {
          headers.set('Authorization', `Bearer ${token}`); // ← sent to Express backend
        } else {
          console.warn('[SetHeader] No access token found');
        }
      } catch (_) {
        console.warn('[SetHeader] Failed to attach auth token');
      }
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