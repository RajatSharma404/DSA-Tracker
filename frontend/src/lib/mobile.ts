import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';

/**
 * Helper to check if the app is currently running inside a native mobile shell (Android or iOS)
 */
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Returns current platform name: 'android', 'ios', or 'web'
 */
export const getPlatform = (): 'android' | 'ios' | 'web' => {
  return Capacitor.getPlatform() as 'android' | 'ios' | 'web';
};

/**
 * Triggers native haptic tactile feedback on mobile devices.
 * Automatically no-ops safely when running in a standard desktop browser.
 */
export const triggerHaptic = async (
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'
) => {
  if (!isNativePlatform()) return;

  try {
    switch (type) {
      case 'success':
        await Haptics.notification({ type: NotificationType.Success });
        break;
      case 'warning':
        await Haptics.notification({ type: NotificationType.Warning });
        break;
      case 'error':
        await Haptics.notification({ type: NotificationType.Error });
        break;
      case 'heavy':
        await Haptics.impact({ style: ImpactStyle.Heavy });
        break;
      case 'medium':
        await Haptics.impact({ style: ImpactStyle.Medium });
        break;
      case 'light':
      default:
        await Haptics.impact({ style: ImpactStyle.Light });
        break;
    }
  } catch {
    // Ignore haptic errors silently on unsupported devices
  }
};

/**
 * Configure Status Bar for dark theme
 */
export const configureMobileStatusBar = async (dark = true) => {
  if (!isNativePlatform()) return;

  try {
    await StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light });
    await StatusBar.setBackgroundColor({ color: dark ? '#090d16' : '#ffffff' });
  } catch {
    // Ignore on unsupported platforms
  }
};

/**
 * Register Android hardware back button handler
 */
export const initMobileAppListeners = (onBackPress?: () => boolean | void) => {
  if (!isNativePlatform()) return () => {};

  const backListener = App.addListener('backButton', ({ canGoBack }) => {
    if (onBackPress) {
      const handled = onBackPress();
      if (handled) return;
    }

    if (canGoBack) {
      window.history.back();
    } else {
      App.exitApp();
    }
  });

  return () => {
    backListener.then((handle) => handle.remove());
  };
};
