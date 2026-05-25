// components/QRScanner.jsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { Camera } from 'react-native-camera-kit';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const FRAME_SIZE    = SCREEN_WIDTH * 0.65;
const CORNER_SIZE   = 28;
const CORNER_BORDER = 4;

const QRScanner = ({
  onScan,
  onError,
  onClose,
  scanInterval    = 2000,
  borderColor     = '#00FF00',
  hint            = 'Align QR code within the frame',
  showCloseButton = true,
  closeLabel      = 'Close',
}) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading]             = useState(true);
  const [scanned, setScanned]             = useState(false);
  const lastScanned                       = useRef(null);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const permission = Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA;

      const result = await check(permission);
      if (result === RESULTS.GRANTED) {
        setHasPermission(true);
      } else {
        const requested = await request(permission);
        setHasPermission(requested === RESULTS.GRANTED);
        if (requested !== RESULTS.GRANTED) onError?.('Camera permission denied');
      }
    } catch (error) {
      onError?.(error?.message ?? 'Permission error');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = ({ nativeEvent }) => {
    const data   = nativeEvent?.codeStringValue;
    const format = nativeEvent?.codeFormat;
    if (!data || scanned) return;
    if (lastScanned.current === data) return;
    lastScanned.current = data;
    setScanned(true);
    onScan?.(data, format);
    setTimeout(() => {
      setScanned(false);
      lastScanned.current = null;
    }, scanInterval);
  };

  // ─── Loading ──────────────────────────
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00FF00" />
        <Text style={styles.hintText}>Requesting camera permission...</Text>
      </View>
    );
  }

  // ─── No Permission ────────────────────
  if (!hasPermission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Camera permission denied</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={requestCameraPermission}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Scanner ──────────────────────────
  return (
    <View style={styles.root}>

      {/* ✅ Camera — fills full screen */}
      <Camera
        style={styles.camera}
        scanBarcode
        onReadCode={handleScan}
        showFrame={false}
      />

      {/* ✅ Overlay — flex layout for perfect centering */}
      <View style={styles.overlay}>

        {/* Top dark section — flex:1 */}
        <View style={styles.overlayTop} />

        {/* Middle row — camera hole */}
        <View style={styles.middleRow}>

          {/* Left dark */}
          <View style={styles.overlaySide} />

          {/* ✅ Transparent scan frame */}
          <View style={styles.frame}>

            {/* Top Left Corner */}
            <View style={[styles.corner, {
              top              : 0,
              left             : 0,
              borderTopWidth   : CORNER_BORDER,
              borderLeftWidth  : CORNER_BORDER,
              borderBottomWidth: 0,
              borderRightWidth : 0,
              borderColor,
            }]} />

            {/* Top Right Corner */}
            <View style={[styles.corner, {
              top              : 0,
              right            : 0,
              borderTopWidth   : CORNER_BORDER,
              borderRightWidth : CORNER_BORDER,
              borderBottomWidth: 0,
              borderLeftWidth  : 0,
              borderColor,
            }]} />

            {/* Bottom Left Corner */}
            <View style={[styles.corner, {
              bottom           : 0,
              left             : 0,
              borderBottomWidth: CORNER_BORDER,
              borderLeftWidth  : CORNER_BORDER,
              borderTopWidth   : 0,
              borderRightWidth : 0,
              borderColor,
            }]} />

            {/* Bottom Right Corner */}
            <View style={[styles.corner, {
              bottom           : 0,
              right            : 0,
              borderBottomWidth: CORNER_BORDER,
              borderRightWidth : CORNER_BORDER,
              borderTopWidth   : 0,
              borderLeftWidth  : 0,
              borderColor,
            }]} />

          </View>

          {/* Right dark */}
          <View style={styles.overlaySide} />

        </View>

        {/* Bottom dark section — flex:1 */}
        <View style={styles.overlayBottom}>
          <Text style={styles.hintText}>{hint}</Text>

          {scanned && (
            <View style={styles.scannedBadge}>
              <Text style={styles.scannedText}>✅ Scanned!</Text>
            </View>
          )}

          {showCloseButton && (
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>{closeLabel}</Text>
            </TouchableOpacity>
          )}
        </View>

      </View>
    </View>
  );
};

// ─────────────────────────────────────────
// Styles
// ─────────────────────────────────────────
const styles = StyleSheet.create({

  // ─── Root ─────────────────────────────
  root: {
    flex           : 1,
    backgroundColor: '#000',
  },

  // ─── Camera ───────────────────────────
  camera: {
    position: 'absolute',
    top     : 0,
    left    : 0,
    width   : SCREEN_WIDTH,
    height  : SCREEN_HEIGHT,
  },

  // ─── Overlay ──────────────────────────
  overlay: {
    flex         : 1,
    flexDirection: 'column',
  },

  // ✅ Equal flex top & bottom = perfect center
  overlayTop: {
    flex           : 1,
    backgroundColor: 'rgba(0,0,0,0.60)',
  },

  middleRow: {
    flexDirection: 'row',
    height       : FRAME_SIZE,
  },

  overlaySide: {
    flex           : 1,
    backgroundColor: 'rgba(0,0,0,0.60)',
  },

  overlayBottom: {
    flex           : 1,
    backgroundColor: 'rgba(0,0,0,0.60)',
    alignItems     : 'center',
    justifyContent : 'flex-start',   // ✅ content sticks near frame
    paddingTop     : 24,
    gap            : 16,
  },

  // ─── Scan Frame ───────────────────────
  frame: {
    width          : FRAME_SIZE,
    height         : FRAME_SIZE,
    backgroundColor: 'transparent',
  },

  // ─── Corners ──────────────────────────
  corner: {
    position       : 'absolute',
    width          : CORNER_SIZE,
    height         : CORNER_SIZE,
    backgroundColor: 'transparent',  // ✅ no fill
  },

  // ─── Hint ─────────────────────────────
  hintText: {
    color            : '#fff',
    fontSize         : 14,
    textAlign        : 'center',
    paddingHorizontal: 24,
  },

  // ─── Scanned Badge ────────────────────
  scannedBadge: {
    backgroundColor  : '#00000099',
    paddingHorizontal: 20,
    paddingVertical  : 10,
    borderRadius     : 20,
  },
  scannedText: {
    color     : '#00FF00',
    fontSize  : 16,
    fontWeight: 'bold',
  },

  // ─── Close Button ─────────────────────
  closeBtn: {
    marginTop        : 8,              // ✅ normal flow, no absolute
    backgroundColor  : '#ffffff22',
    paddingHorizontal: 32,
    paddingVertical  : 12,
    borderRadius     : 30,
  },
  closeText: {
    color     : '#fff',
    fontSize  : 16,
    fontWeight: '600',
  },

  // ─── Permission States ────────────────
  centered: {
    flex           : 1,
    justifyContent : 'center',
    alignItems     : 'center',
    backgroundColor: '#000',
    gap            : 16,
  },
  errorText: {
    color   : '#ff4444',
    fontSize: 16,
  },
  retryBtn: {
    backgroundColor  : '#00FF00',
    paddingHorizontal: 24,
    paddingVertical  : 10,
    borderRadius     : 8,
  },
  retryText: {
    color     : '#000',
    fontWeight: 'bold',
  },
});

export default QRScanner;