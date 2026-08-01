// components/AppModal.jsx
import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import useThemeProvider from '../Theme/useThemeProvider';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const AppModal = ({
  visible              = false,
  onClose,
  title,
  subtitle,
  children,
  type                 = 'center',
  size                 = 'medium',
  showHeader           = true,
  showCloseButton      = true,
  closeLabel           = '✕',
  closeOnBackdrop      = true,
  backdropColor        = 'rgba(0,0,0,0.75)',
  footer,
  scrollable           = false,
  avoidKeyboard        = true,
  statusBarTranslucent = true,
}) => {

  const { current_theme: c } = useThemeProvider();

  const slideAnim = useRef(new Animated.Value(60)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  const isBottom     = type === 'bottom';
  const isFullscreen = type === 'fullscreen';
  const isCenter     = type === 'center';

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue        : 1,
          duration       : 220,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue        : 0,
          tension        : 65,
          friction       : 11,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue        : 1,
          tension        : 65,
          friction       : 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue        : 0,
          duration       : 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue        : 60,
          duration       : 180,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue        : 0.92,
          duration       : 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const sizeStyles = {
    small     : { maxHeight: SCREEN_HEIGHT * 0.35 },
    medium    : { maxHeight: SCREEN_HEIGHT * 0.55 },
    large     : { maxHeight: SCREEN_HEIGHT * 0.80 },
    fullscreen: { flex: 1 },
  };

  const modalAnimStyle = {
    opacity  : fadeAnim,
    transform: isCenter
      ? [{ scale: scaleAnim }]
      : [{ translateY: slideAnim }],
  };

  const ContentWrapper = scrollable ? ScrollView : View;
  const contentProps   = scrollable
    ? { showsVerticalScrollIndicator: false, bounces: false }
    : {};

  // ─── Fullscreen ───────────────────────────────────────────────────
  if (isFullscreen) {
    return (
      <Modal
        visible={visible}
        transparent={false}
        animationType="slide"
        statusBarTranslucent={statusBarTranslucent}
        onRequestClose={onClose}
      >
        
        <View style={[styles.fullscreenRoot, { backgroundColor: c.background }]}>
          {children}
        </View>
      </Modal>
    );
  }

  // ─── Center / Bottom Modal ────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={statusBarTranslucent}
      onRequestClose={onClose}
    >
      {/*
        ✅ KEY FIX: The outermost View fills the screen with backdropColor.
        This is NOT animated — it's always fully opaque when Modal is visible.
        This is the most reliable way to show backdrop on Android.
      */}
      <View style={[styles.root, { backgroundColor: backdropColor }]}>

        {/* Tap backdrop to close */}
        <TouchableWithoutFeedback onPress={closeOnBackdrop ? onClose : undefined}>
          <View style={styles.backdropTouchArea} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={avoidKeyboard
            ? (Platform.OS === 'ios' ? 'padding' : undefined)
            : undefined
          }
          pointerEvents="box-none"
        >
          {/* Position Wrapper */}
          <View
            pointerEvents="box-none"
            style={[
              styles.positionWrapper,
              isBottom && styles.positionBottom,
              isCenter && styles.positionCenter,
            ]}
          >
            <Animated.View style={[
              styles.modalBox,
              { backgroundColor: c.surface },
              isBottom && styles.bottomBox,
              isCenter && styles.centerBox,
              sizeStyles[size],
              modalAnimStyle,
            ]}>

              {/* Bottom Sheet Handle */}
              {isBottom && (
                <View style={styles.handleWrapper}>
                  <View style={[styles.handle, { backgroundColor: c.border }]} />
                </View>
              )}

              {/* Header */}
              {showHeader && (title || showCloseButton) && (
                <View style={styles.header}>
                  <View style={styles.headerText}>
                    {title && (
                      <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>
                        {title}
                      </Text>
                    )}
                    {subtitle && (
                      <Text
                        style={[styles.subtitle, { color: c.muted ?? c.textMuted ?? '#9BA3B8' }]}
                        numberOfLines={2}>
                        {subtitle}
                      </Text>
                    )}
                  </View>
                  {showCloseButton && (
                    <TouchableOpacity
                      style={[styles.closeBtn, { backgroundColor: c.border }]}
                      onPress={onClose}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={[styles.closeText, { color: c.text }]}>{closeLabel}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Divider */}
              {showHeader && title && (
                <View style={[styles.divider, { backgroundColor: c.border }]} />
              )}

              {/* Body */}
              <ContentWrapper style={styles.body} {...contentProps}>
                {children}
              </ContentWrapper>

              {/* Footer */}
              {footer && (
                <>
                  <View style={[styles.divider, { backgroundColor: c.border }]} />
                  <View style={styles.footer}>{footer}</View>
                </>
              )}

            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({

  // ✅ Root fills entire Modal — backgroundColor = backdropColor
  root: {
    flex: 1,
  },

  // ✅ Invisible full-screen touch area behind the modal for close-on-backdrop
  backdropTouchArea: {
    ...StyleSheet.absoluteFillObject,
  },

  // ✅ KeyboardAvoidingView sits on top, pointerEvents box-none so touches pass through to backdropTouchArea
  keyboardView: {
    flex          : 1,
    pointerEvents : 'box-none',
  },

  fullscreenRoot: {
    flex: 1,
  },

  positionWrapper: {
    position: 'absolute',
    left    : 0,
    right   : 0,
  },
  positionCenter: {
    top              : 0,
    bottom           : 0,
    justifyContent   : 'center',
    alignItems       : 'center',
    paddingHorizontal: 20,
  },
  positionBottom: {
    bottom: 0,
  },

  modalBox: {
    borderRadius: 16,
    overflow    : 'hidden',
    width       : '100%',
  },
  centerBox: {
    borderRadius: 16,
  },
  bottomBox: {
    borderTopLeftRadius : 20,
    borderTopRightRadius: 20,
    borderRadius        : 0,
  },

  handleWrapper: {
    alignItems     : 'center',
    paddingVertical: 10,
  },
  handle: {
    width       : 40,
    height      : 4,
    borderRadius: 2,
  },

  header: {
    flexDirection    : 'row',
    alignItems       : 'center',
    justifyContent   : 'space-between',
    paddingHorizontal: 20,
    paddingTop       : 18,
    paddingBottom    : 12,
  },
  headerText: {
    flex        : 1,
    paddingRight: 12,
  },
  title: {
    fontSize  : 17,
    fontWeight: '700',
  },
  subtitle: {
    fontSize : 13,
    marginTop: 2,
  },
  closeBtn: {
    width         : 32,
    height        : 32,
    borderRadius  : 16,
    alignItems    : 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize  : 14,
    fontWeight: '600',
  },

  divider: {
    height: 1,
  },

  body: {
    padding: 20,
  },

  footer: {
    padding      : 16,
    flexDirection: 'row',
    gap          : 10,
  },
});

export default AppModal;