import { useState } from 'react';

export interface AlertConfig {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  singleButton?: boolean;
  confirmDestructive?: boolean;
  icon?: keyof typeof import('@expo/vector-icons').MaterialCommunityIcons.glyphMap;
}

interface UseAlertReturn {
  alertProps: AlertConfig & { visible: boolean; onDismiss: () => void };
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
}

export function useAlert(): UseAlertReturn {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertConfig>({ message: '' });

  const showAlert = (cfg: AlertConfig) => {
    setConfig(cfg);
    setVisible(true);
  };

  const hideAlert = () => {
    setVisible(false);
  };

  return {
    alertProps: {
      ...config,
      visible,
      onDismiss: hideAlert,
    },
    showAlert,
    hideAlert,
  };
}
