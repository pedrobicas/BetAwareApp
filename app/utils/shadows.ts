import { Platform } from 'react-native';

/**
 * Função utilitária para criar sombras compatíveis entre iOS, Android e Web
 * @param elevation Elevação para Android (número)
 * @param shadowConfig Configuração de sombra para iOS/Web
 */
export const createShadow = (elevation: number, shadowConfig?: {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
}) => {
  const defaultShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  };

  const shadow = { ...defaultShadow, ...shadowConfig };

  if (Platform.OS === 'android') {
    return {
      elevation,
    };
  }

  if (Platform.OS === 'web') {
    const { shadowColor, shadowOffset, shadowOpacity, shadowRadius } = shadow;
    return {
      boxShadow: `${shadowOffset.width}px ${shadowOffset.height}px ${shadowRadius}px ${shadowColor}${Math.round(shadowOpacity * 255).toString(16).padStart(2, '0')}`,
    };
  }

  // iOS
  return {
    ...shadow,
    elevation, // Mantém elevation também para compatibilidade
  };
};

/**
 * Sombras pré-definidas comuns
 */
export const shadows = {
  small: createShadow(2, {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  }),
  medium: createShadow(4, {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  }),
  large: createShadow(8, {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  }),
  none: createShadow(0, {
    shadowOpacity: 0,
  }),
};
