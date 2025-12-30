import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import {
  X,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react-native";
import { theme } from "../theme/tokens";

type ToastType = "success" | "error" | "warning" | "info";

type ToastProps = {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
  visible?: boolean;
};

const Toast: React.FC<ToastProps> = ({
  message,
  type = "info",
  duration = 4000,
  onClose,
  visible = true,
}) => {
  const translateYAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: theme.animation.duration.normal,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: theme.animation.duration.normal,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateYAnim, {
        toValue: -100,
        duration: theme.animation.duration.normal,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: theme.animation.duration.normal,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.();
    });
  };

  const getToastConfig = () => {
    switch (type) {
      case "success":
        return {
          backgroundColor: theme.colors.primary[50],
          borderColor: theme.colors.primary[200],
          icon: CheckCircle,
          iconColor: theme.colors.success,
        };
      case "error":
        return {
          backgroundColor: theme.colors.error + "10",
          borderColor: theme.colors.error + "20",
          icon: AlertCircle,
          iconColor: theme.colors.error,
        };
      case "warning":
        return {
          backgroundColor: theme.colors.secondary[50],
          borderColor: theme.colors.secondary[200],
          icon: AlertTriangle,
          iconColor: theme.colors.warning,
        };
      default:
        return {
          backgroundColor: theme.colors.info + "10",
          borderColor: theme.colors.info + "20",
          icon: Info,
          iconColor: theme.colors.info,
        };
    }
  };

  const config = getToastConfig();
  const Icon = config.icon;

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
          transform: [{ translateY: translateYAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <Icon size={20} color={config.iconColor} style={styles.icon} />
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <X size={16} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Toast Manager for multiple toasts
type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
};

let toastId = 0;

export const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const showToast = (
    message: string,
    type: ToastType = "info",
    duration = 4000
  ) => {
    const id = `toast-${++toastId}`;
    const newToast: ToastItem = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  };

  const hideToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const ToastContainer = () => (
    <View style={styles.toastContainer}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </View>
  );

  return { showToast, hideToast, ToastContainer };
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: theme.spacing.xl * 2,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    padding: theme.spacing.md,
    ...theme.shadows.md,
    zIndex: theme.zIndex.toast,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  closeButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  toastContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: theme.zIndex.toast,
  },
});

export default Toast;
