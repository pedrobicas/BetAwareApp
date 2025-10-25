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
  View,
} from 'react-native';
import api from './service/api';
// --- NOVO BLOCO 1: Importa a biblioteca para selecionar imagens ---
import * as ImagePicker from 'expo-image-picker';

export default function RegisterScreen() {
  // SEUS ESTADOS ORIGINAIS - MANTIDOS
  const [username, setUsername] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- NOVO BLOCO 2: Estado para armazenar a imagem facial ---
  const [facialImage, setFacialImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  // -----------------------------------------------------------

  // SUAS FUNÇÕES ORIGINAIS - MANTIDAS
  const validarCpf = (cpf: string): boolean => {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;

    // Validação do CPF (seu código original)
    if (/^(\d)\1+$/.test(cpf)) return false;
    let soma = 0;
    let resto;
    for (let i = 1; i <= 9; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
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

  // --- NOVO BLOCO 3: Função para selecionar a imagem facial ---
  const handleSelectFacialImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para o cadastro facial.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setFacialImage(result.assets[0]);
      setErrors(prev => ({ ...prev, facialImage: '' })); // Limpa o erro ao selecionar
    }
  };
  // -----------------------------------------------------------

  // --- FUNÇÃO DE CADASTRO ATUALIZADA ---
  const handleCadastro = async () => {
    // Limpar erros anteriores
    setErrors({});
    let hasError = false; // Variável de controle

    // Suas validações originais
    if (username.length < 3) {
      setErrors(prev => ({ ...prev, username: 'O usuário deve ter pelo menos 3 caracteres' })); hasError = true;
    }
    if (!nome) {
      setErrors(prev => ({ ...prev, nome: 'O nome é obrigatório' })); hasError = true;
    }
    if (!email || !email.includes('@')) {
      setErrors(prev => ({ ...prev, email: 'Email inválido' })); hasError = true;
    }
    if (!validarCpf(cpf)) {
      setErrors(prev => ({ ...prev, cpf: 'CPF inválido' })); hasError = true;
    }
    if (cep.length !== 8) {
      setErrors(prev => ({ ...prev, cep: 'CEP deve conter 8 dígitos' })); hasError = true;
    }
    if (!endereco) {
      setErrors(prev => ({ ...prev, cep: 'Busque o endereço pelo CEP' })); hasError = true;
    }
    if (senha.length < 4) {
      setErrors(prev => ({ ...prev, senha: 'A senha deve ter pelo menos 4 caracteres' })); hasError = true;
    }
    // Nova validação para a imagem facial
    if (!facialImage) {
      setErrors(prev => ({ ...prev, facialImage: 'A foto para cadastro facial é obrigatória' })); hasError = true;
    }

    if (hasError) return; // Para a execução se houver qualquer erro

    setLoading(true);
    try {
      // ETAPA 1: Cadastrar o rosto na nossa API Python
      const formData = new FormData();
      const uri = facialImage!.uri;
      const filename = uri.split('/').pop()!;
      const type = `image/${filename.split('.').pop()}`;
      formData.append('username', username);
      formData.append('file', { uri, name: filename, type } as any);

      // Lembre-se de usar seu IP
      const facialResponse = await fetch('http://192.168.15.51:5000/api/register-face', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const facialData = await facialResponse.json();
      if (!facialData.success) {
        throw new Error(facialData.message || 'Falha ao cadastrar o rosto.');
      }
      
      // ETAPA 2: Cadastrar o usuário na API principal (se o cadastro do rosto funcionou)
      await api.register({
        username, nome, email, cpf, cep, endereco, senha
      });
      
      Alert.alert('Sucesso', 'Cadastro realizado com sucesso, incluindo o rosto para login!');
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
  // --- FIM DA FUNÇÃO ATUALIZADA ---

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>

      {/* SEU FORMULÁRIO ORIGINAL - 100% MANTIDO */}
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

      {/* --- NOVO BLOCO 4: Adiciona o botão de seleção de foto na tela --- */}
      <View style={styles.formGroup}>
        <Text style={styles.facialLabel}>Foto para Login Facial</Text>
        <TouchableOpacity 
          style={[styles.facialButton, errors.facialImage ? styles.inputError : null]}
          onPress={handleSelectFacialImage}
        >
          <Text style={styles.facialButtonText}>
            {facialImage ? 'Imagem Selecionada!' : 'Escolher Foto do Rosto'}
          </Text>
        </TouchableOpacity>
        {errors.facialImage ? <Text style={styles.errorText}>{errors.facialImage}</Text> : null}
      </View>
      {/* ------------------------------------------------------------------- */}

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

// SEUS ESTILOS ORIGINAIS + OS NOVOS PARA A PARTE FACIAL
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
    color: '#0a5c2c',
    marginTop: 30,
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
    marginBottom: 40,
    alignItems: 'center'
  },
  loginText: {
    color: '#0a5c2c',
    fontSize: 16,
    textDecorationLine: 'underline'
  },
  // --- NOVO BLOCO 5: Estilos para os novos componentes ---
  facialLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontWeight: '500'
  },
  facialButton: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  facialButtonText: {
    color: '#0a5c2c',
    fontSize: 16,
  }
});