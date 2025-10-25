import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../service/api';
import * as ImagePicker from 'expo-image-picker';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [senhaError, setSenhaError] = useState('');
  const [isOffline, setIsOffline] = useState(false);

  // --- CÓDIGO ATUALIZADO PARA LOGIN FACIAL ---
  const [facialUsername, setFacialUsername] = useState(''); // Novo estado para o username do login facial
  const [facialLoading, setFacialLoading] = useState(false);
  const [facialFeedback, setFacialFeedback] = useState('');
  // ------------------------------------

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const isOnline = await api.checkApiHealth();
      setIsOffline(!isOnline);
    } catch (error) {
      setIsOffline(true);
    }
  };

  const handleLogin = async () => {
    // Lógica do login normal (sem alterações)
    setUsernameError('');
    setSenhaError('');
    if (username.length < 3) {
      setUsernameError('O usuário deve ter pelo menos 3 caracteres');
      return;
    }
    if (senha.length < 4) {
      setSenhaError('A senha deve ter pelo menos 4 caracteres');
      return;
    }
    setLoading(true);
    try {
      await api.login({ username, senha });
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('API indisponível')) {
          router.replace('/(tabs)/dashboard');
        } else {
          Alert.alert('Erro', error.message);
        }
      } else {
        Alert.alert('Erro', 'Erro ao fazer login');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // --- FUNÇÃO ATUALIZADA PARA O LOGIN FACIAL ---
  const handleFacialLogin = async () => {
    setFacialFeedback('');

    if (!facialUsername) {
      setFacialFeedback('Por favor, digite seu nome de usuário primeiro.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para o login facial.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    setFacialLoading(true);
    setFacialFeedback('Verificando rosto, aguarde...');

    const localUri = result.assets[0].uri;
    const filename = localUri.split('/').pop();
    const type = `image/${filename!.split('.').pop()}`;

    const formData = new FormData();
    formData.append('username', facialUsername); // Envia o nome de usuário digitado
    formData.append('file', { uri: localUri, name: filename, type } as any);

    try {
      // Lembre-se de usar seu IP aqui para testes no celular
      const response = await fetch('http://192.168.15.51:5000/api/face-login', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (data.success) {
        setFacialFeedback(`Bem-vindo, ${data.user_name}!`);
        router.replace('/(tabs)/dashboard');
      } else {
        setFacialFeedback(`Falha na autenticação: ${data.message}`);
      }
    } catch (error) {
      console.error(error);
      setFacialFeedback('Erro de conexão. Verifique se o servidor Python está rodando.');
    } finally {
      setFacialLoading(false);
    }
  };
  // ------------------------------------

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚽ BetAware</Text>
      
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Modo Offline</Text>
        </View>
      )}
      
      <View style={styles.formGroup}>
        <TextInput
          style={[styles.input, usernameError ? styles.inputError : null]}
          placeholder="Email ou Usuário (Login Padrão)"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            setUsernameError('');
          }}
          autoCapitalize="none"
        />
        {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
      </View>

      <View style={styles.formGroup}>
        <TextInput
          style={[styles.input, senhaError ? styles.inputError : null]}
          placeholder="Senha"
          value={senha}
          onChangeText={(text) => {
            setSenha(text);
            setSenhaError('');
          }}
          secureTextEntry
        />
        {senhaError ? <Text style={styles.errorText}>{senhaError}</Text> : null}
      </View>

      <TouchableOpacity 
        style={[styles.button, isOffline && styles.buttonOffline]} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
      </TouchableOpacity>

      {/* --- ELEMENTOS ATUALIZADOS PARA LOGIN FACIAL --- */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OU</Text>
        <View style={styles.dividerLine} />
      </View>
      
      <View style={styles.formGroup}>
        <TextInput
          style={styles.input}
          placeholder="Digite seu usuário para login facial"
          value={facialUsername}
          onChangeText={setFacialUsername}
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity 
        style={styles.facialButton} 
        onPress={handleFacialLogin}
        disabled={facialLoading}
      >
        {facialLoading ? <ActivityIndicator color="#0a5c2c" /> : <Text style={styles.facialButtonText}>Entrar com Rosto</Text>}
      </TouchableOpacity>
      {facialFeedback ? <Text style={styles.feedbackText}>{facialFeedback}</Text> : null}
      {/* ------------------------------------------- */}

      <TouchableOpacity 
        style={styles.registerLink}
        onPress={() => router.push('/register')}
      >
        <Text style={styles.registerText}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff'
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#0a5c2c'
    },
    offlineBanner: {
        backgroundColor: '#ffd700',
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: 'center'
    },
    offlineText: {
        color: '#000',
        fontWeight: 'bold'
    },
    formGroup: {
        marginBottom: 15
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        borderRadius: 8,
        fontSize: 16,
        backgroundColor: '#f9f9f9'
    },
    inputError: {
        borderColor: '#ff3b30'
    },
    errorText: {
        color: '#ff3b30',
        fontSize: 12,
        marginTop: 5
    },
    button: {
        backgroundColor: '#0a5c2c',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10
    },
    buttonOffline: {
        backgroundColor: '#666'
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    registerLink: {
        marginTop: 20,
        alignItems: 'center'
    },
    registerText: {
        color: '#0a5c2c',
        fontSize: 16,
        textDecorationLine: 'underline'
    },
    // --- NOVOS ESTILOS PARA LOGIN FACIAL ---
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd',
    },
    dividerText: {
        marginHorizontal: 10,
        color: '#888',
        fontSize: 14,
    },
    facialButton: {
        backgroundColor: '#e8f5e9',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#0a5c2c'
    },
    facialButtonText: {
        color: '#0a5c2c',
        fontSize: 16,
        fontWeight: 'bold',
    },
    feedbackText: {
        textAlign: 'center',
        marginTop: 10,
        fontSize: 14,
        color: '#0a5c2c',
    },
});