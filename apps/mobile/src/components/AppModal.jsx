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
  backdropColor        = 'rgba(0,0,0,0.6)',
  footer,
  scrollable           = false,
  avoidKeyboard        = true,
  statusBarTranslucent = true,
}) => {

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const isBottom     = type === 'bottom';
  const isFullscreen = type === 'fullscreen';
  const isCenter     = type === 'center';

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue        : 1,
          duration       : 250,
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
          duration       : 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue        : 100,
          duration       : 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue        : 0.95,
          duration       : 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const sizeStyles = {
    small      : { maxHeight: SCREEN_HEIGHT * 0.35 },
    medium     : { maxHeight: SCREEN_HEIGHT * 0.55 },
    large      : { maxHeight: SCREEN_HEIGHT * 0.80 },
    fullscreen : { flex: 1 },
  };

  const animatedStyle = {
    opacity  : fadeAnim,
    transform: isCenter
      ? [{ scale: scaleAnim }]
      : [{ translateY: slideAnim }],
  };

  const ContentWrapper = scrollable ? ScrollView : View;
  const contentProps   = scrollable
    ? { showsVerticalScrollIndicator: false, bounces: false }
    : {};

  // ─── Fullscreen — separate simple render ──
  if (isFullscreen) {
    return (
      <Modal
        visible={visible}
        transparent={false}          // ✅ NOT transparent for fullscreen
        animationType="slide"        // ✅ simple slide for fullscreen
        statusBarTranslucent={statusBarTranslucent}
        onRequestClose={onClose}
      >
        {/* ✅ Full black container */}
        <View style={styles.fullscreenRoot}>
          {children}
        </View>
      </Modal>
    );
  }

  // ─── Center / Bottom Modal ─────────────
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent={statusBarTranslucent}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={avoidKeyboard
          ? (Platform.OS === 'ios' ? 'padding' : undefined)
          : undefined
        }
      >
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={closeOnBackdrop ? onClose : undefined}>
          <Animated.View
            style={[
              styles.backdrop,
              { backgroundColor: backdropColor, opacity: fadeAnim },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Position Wrapper */}
        <View style={[
          styles.positionWrapper,
          isBottom && styles.positionBottom,
          isCenter && styles.positionCenter,
        ]}>
          <Animated.View style={[
            styles.modalBox,
            isBottom && styles.bottomBox,
            isCenter && styles.centerBox,
            sizeStyles[size],
            animatedStyle,
          ]}>

            {/* Bottom Sheet Handle */}
            {isBottom && (
              <View style={styles.handleWrapper}>
                <View style={styles.handle} />
              </View>
            )}

            {/* Header */}
            {showHeader && (title || showCloseButton) && (
              <View style={styles.header}>
                <View style={styles.headerText}>
                  {title && (
                    <Text style={styles.title} numberOfLines={1}>
                      {title}
                    </Text>
                  )}
                  {subtitle && (
                    <Text style={styles.subtitle} numberOfLines={2}>
                      {subtitle}
                    </Text>
                  )}
                </View>
                {showCloseButton && (
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={onClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.closeText}>{closeLabel}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Divider */}
            {showHeader && title && <View style={styles.divider} />}

            {/* Body */}
            <ContentWrapper style={styles.body} {...contentProps}>
              {children}
            </ContentWrapper>

            {/* Footer */}
            {footer && (
              <>
                <View style={styles.divider} />
                <View style={styles.footer}>{footer}</View>
              </>
            )}

          </Animated.View>
        </View>

      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  // ✅ Fullscreen root — takes entire screen
  fullscreenRoot: {
    flex           : 1,
    backgroundColor: '#000',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
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
    backgroundColor: '#1E2130',
    borderRadius   : 16,
    overflow       : 'hidden',
    width          : '100%',
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
    width          : 40,
    height         : 4,
    borderRadius   : 2,
    backgroundColor: '#ffffff33',
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
    color     : '#FFFFFF',
  },
  subtitle: {
    fontSize : 13,
    color    : '#9BA3B8',
    marginTop: 2,
  },
  closeBtn: {
    width          : 32,
    height         : 32,
    borderRadius   : 16,
    backgroundColor: '#ffffff15',
    alignItems     : 'center',
    justifyContent : 'center',
  },
  closeText: {
    color     : '#FFFFFF',
    fontSize  : 14,
    fontWeight: '600',
  },

  divider: {
    height         : 1,
    backgroundColor: '#ffffff10',
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