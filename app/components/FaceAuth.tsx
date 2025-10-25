import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

interface FaceAuthProps {
  onAuthSuccess: (username: string) => void;
  onAuthError: (error: string) => void;
  mode: 'register' | 'login';
  username?: string; // Required for register mode
}

const FACE_API_BASE_URL = 'http://localhost:5000/api';

export default function FaceAuth({ onAuthSuccess, onAuthError, mode, username }: FaceAuthProps) {
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef<Camera>(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setLoading(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        setShowCamera(false);
        await processImage(photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
        onAuthError('Erro ao capturar imagem');
      } finally {
        setLoading(false);
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setLoading(true);
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      onAuthError('Erro ao selecionar imagem');
    } finally {
      setLoading(false);
    }
  };

  const processImage = async (imageUri: string) => {
    try {
      const formData = new FormData();
      
      // Add image file
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'face.jpg',
      } as any);

      // Add username for register mode
      if (mode === 'register' && username) {
        formData.append('username', username);
      }

      const endpoint = mode === 'register' ? '/register-face' : '/face-login';
      
      const response = await fetch(`${FACE_API_BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();

      if (result.success) {
        if (mode === 'register') {
          onAuthSuccess(username!);
        } else {
          onAuthSuccess(result.user_name);
        }
      } else {
        onAuthError(result.message || 'Erro na autenticação facial');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      onAuthError('Erro de conexão com o servidor');
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Solicitando permissão da câmera...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Acesso à câmera negado. Por favor, habilite nas configurações.
        </Text>
      </View>
    );
  }

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={CameraType.front}
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.faceFrame} />
            <Text style={styles.instructionText}>
              Posicione seu rosto dentro do quadro
            </Text>
            <View style={styles.cameraButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCamera(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Capturar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Camera>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {mode === 'register' ? 'Cadastrar Face' : 'Login Facial'}
      </Text>
      <Text style={styles.subtitle}>
        {mode === 'register' 
          ? 'Tire uma foto para cadastrar sua face'
          : 'Use sua face para fazer login'
        }
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowCamera(true)}
          disabled={loading}
        >
          <Text style={styles.actionButtonText}>📷 Usar Câmera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={pickImage}
          disabled={loading}
        >
          <Text style={styles.actionButtonText}>🖼️ Escolher da Galeria</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            {mode === 'register' ? 'Cadastrando face...' : 'Autenticando...'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
  },
  faceFrame: {
    width: 200,
    height: 200,
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 100,
    backgroundColor: 'transparent',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  cameraButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  captureButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
  },
});