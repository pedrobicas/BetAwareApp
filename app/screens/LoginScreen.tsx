import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import api from '../service/api';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [senhaError, setSenhaError] = useState('');
  const [isOffline, setIsOffline] = useState(false);

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
    // Limpar erros anteriores
    setUsernameError('');
    setSenhaError('');

    // Validações
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
          Alert.alert(
            'Modo Offline',
            'Você está usando o aplicativo em modo offline. Algumas funcionalidades podem estar limitadas.',
            [{ text: 'OK' }]
          );
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
          placeholder="Usuário"
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
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>

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
  }
});
