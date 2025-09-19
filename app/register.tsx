import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import api from './service/api';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validarCpf = (cpf: string): boolean => {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;

    // Validação do CPF
    let soma = 0;
    let resto;

    if (cpf === '00000000000') return false;

    for (let i = 1; i <= 9; i++) {
      soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  };

  const buscarEndereco = async () => {
    if (cep.length !== 8) {
      setErrors(prev => ({ ...prev, cep: 'CEP deve conter 8 dígitos' }));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        setErrors(prev => ({ ...prev, cep: 'CEP não encontrado' }));
        setEndereco('');
      } else {
        setEndereco(`${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`);
        setErrors(prev => ({ ...prev, cep: '' }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, cep: 'Erro ao buscar CEP' }));
      setEndereco('');
    } finally {
      setLoading(false);
    }
  };

  const handleCadastro = async () => {
    // Limpar erros anteriores
    setErrors({});

    // Validações
    if (username.length < 3) {
      setErrors(prev => ({ ...prev, username: 'O usuário deve ter pelo menos 3 caracteres' }));
      return;
    }

    if (!nome) {
      setErrors(prev => ({ ...prev, nome: 'O nome é obrigatório' }));
      return;
    }

    if (!email || !email.includes('@')) {
      setErrors(prev => ({ ...prev, email: 'Email inválido' }));
      return;
    }

    if (!validarCpf(cpf)) {
      setErrors(prev => ({ ...prev, cpf: 'CPF inválido' }));
      return;
    }

    if (cep.length !== 8) {
      setErrors(prev => ({ ...prev, cep: 'CEP deve conter 8 dígitos' }));
      return;
    }

    if (!endereco) {
      setErrors(prev => ({ ...prev, cep: 'Busque o endereço pelo CEP' }));
      return;
    }

    if (senha.length < 4) {
      setErrors(prev => ({ ...prev, senha: 'A senha deve ter pelo menos 4 caracteres' }));
      return;
    }

    setLoading(true);
    try {
      await api.register({
        username,
        nome,
        email,
        cpf,
        cep,
        endereco,
        senha
      });
      
      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
      router.replace('/');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Erro', error.message);
      } else {
        Alert.alert('Erro', 'Não foi possível realizar o cadastro');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>

      <View style={styles.formGroup}>
        <TextInput
          style={[styles.input, errors.username ? styles.inputError : null]}
          placeholder="Usuário"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            setErrors(prev => ({ ...prev, username: '' }));
          }}
          autoCapitalize="none"
        />
        {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
      </View>

      <View style={styles.formGroup}>
        <TextInput
          style={[styles.input, errors.nome ? styles.inputError : null]}
          placeholder="Nome completo"
          value={nome}
          onChangeText={(text) => {
            setNome(text);
            setErrors(prev => ({ ...prev, nome: '' }));
          }}
        />
        {errors.nome ? <Text style={styles.errorText}>{errors.nome}</Text> : null}
      </View>

      <View style={styles.formGroup}>
        <TextInput
          style={[styles.input, errors.email ? styles.inputError : null]}
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrors(prev => ({ ...prev, email: '' }));
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
      </View>

      <View style={styles.formGroup}>
        <TextInput
          style={[styles.input, errors.cpf ? styles.inputError : null]}
          placeholder="CPF (somente números)"
          value={cpf}
          onChangeText={(text) => {
            setCpf(text.replace(/[^\d]/g, ''));
            setErrors(prev => ({ ...prev, cpf: '' }));
          }}
          keyboardType="numeric"
          maxLength={11}
        />
        {errors.cpf ? <Text style={styles.errorText}>{errors.cpf}</Text> : null}
      </View>

      <View style={styles.formGroup}>
        <View style={styles.cepContainer}>
          <TextInput
            style={[styles.input, styles.cepInput, errors.cep ? styles.inputError : null]}
            placeholder="CEP"
            value={cep}
            onChangeText={(text) => {
              setCep(text.replace(/[^\d]/g, ''));
              setErrors(prev => ({ ...prev, cep: '' }));
            }}
            keyboardType="numeric"
            maxLength={8}
          />
          <TouchableOpacity 
            style={styles.cepButton}
            onPress={buscarEndereco}
            disabled={loading}
          >
            <Text style={styles.cepButtonText}>Buscar</Text>
          </TouchableOpacity>
        </View>
        {errors.cep ? <Text style={styles.errorText}>{errors.cep}</Text> : null}
      </View>

      <View style={styles.formGroup}>
        <TextInput
          style={[styles.input, styles.enderecoInput]}
          placeholder="Endereço"
          value={endereco}
          editable={false}
        />
      </View>

      <View style={styles.formGroup}>
        <TextInput
          style={[styles.input, errors.senha ? styles.inputError : null]}
          placeholder="Senha"
          value={senha}
          onChangeText={(text) => {
            setSenha(text);
            setErrors(prev => ({ ...prev, senha: '' }));
          }}
          secureTextEntry
        />
        {errors.senha ? <Text style={styles.errorText}>{errors.senha}</Text> : null}
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={handleCadastro}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Cadastrar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.loginLink}
        onPress={() => router.push('/')}
      >
        <Text style={styles.loginText}>Já tem conta? Faça login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#0a5c2c'
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
  cepContainer: {
    flexDirection: 'row',
    gap: 10
  },
  cepInput: {
    flex: 1
  },
  cepButton: {
    backgroundColor: '#0a5c2c',
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center'
  },
  cepButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  enderecoInput: {
    backgroundColor: '#f0f0f0'
  },
  button: {
    backgroundColor: '#0a5c2c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center'
  },
  loginText: {
    color: '#0a5c2c',
    fontSize: 16,
    textDecorationLine: 'underline'
  }
});
