import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface Aposta {
  id: number;
  categoria: string;
  jogo: string;
  valor: number;
  resultado: string;
  data: string;
}

interface NovaAposta {
  categoria: string;
  jogo: string;
  valor: number;
  resultado: string;
}

interface Usuario {
  username: string;
  nome: string;
  email: string;
  cpf: string;
  cep: string;
  endereco: string;
  senha: string;
}

const API_URL = 'http://localhost:8080/api/v1';
const HEALTH_CHECK_INTERVAL = 30000; // 30 segundos

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isApiAvailable = true;

// Verificação periódica da saúde da API
const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    isApiAvailable = response.ok;
    return response.ok;
  } catch (error) {
    isApiAvailable = false;
    return false;
  }
};

// Iniciar verificação periódica
setInterval(checkApiHealth, HEALTH_CHECK_INTERVAL);

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Funções auxiliares para gerenciamento local
const getLocalData = async (key: string) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Erro ao ler dados locais:', error);
    return null;
  }
};

const setLocalData = async (key: string, data: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar dados locais:', error);
  }
};

// Funções de autenticação
export const login = async (credentials: { username: string; senha: string }) => {
  try {
    if (!isApiAvailable) {
      const usuarios = await getLocalData('usuarios') || [];
      const usuario = usuarios.find((u: Usuario) => 
        u.username === credentials.username && u.senha === credentials.senha
      );
      
      if (usuario) {
        const userData = {
          token: 'offline-token',
          username: usuario.username,
          nome: usuario.nome,
          perfil: 'USER'
        };
        await setLocalData('usuarioLogado', userData);
        await AsyncStorage.setItem('token', 'offline-token');
        return userData;
      }
      throw new Error('Usuário não encontrado');
    }

    const response = await api.post('/auth/login', credentials);
    const { token, username, nome, perfil } = response.data;
    
    const userData = { token, username, nome, perfil };
    await setLocalData('usuarioLogado', userData);
    await AsyncStorage.setItem('token', token);
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    }
    throw error;
  }
};

export const register = async (userData: Usuario) => {
  try {
    if (!isApiAvailable) {
      const usuarios = await getLocalData('usuarios') || [];
      
      if (usuarios.some((u: Usuario) => u.username === userData.username)) {
        throw new Error('Este nome de usuário já está em uso');
      }
      if (usuarios.some((u: Usuario) => u.email === userData.email)) {
        throw new Error('Este email já está em uso');
      }
      if (usuarios.some((u: Usuario) => u.cpf === userData.cpf)) {
        throw new Error('Este CPF já está em uso');
      }

      usuarios.push(userData);
      await setLocalData('usuarios', usuarios);
      return;
    }

    await api.post('/auth/register', userData);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'Erro ao cadastrar';
      if (errorMessage.includes('username')) {
        throw new Error('Este nome de usuário já está em uso');
      } else if (errorMessage.includes('email')) {
        throw new Error('Este email já está em uso');
      } else if (errorMessage.includes('cpf')) {
        throw new Error('Este CPF já está em uso');
      }
      throw new Error(errorMessage);
    }
    throw error;
  }
};

// Funções de apostas
export const criarAposta = async (aposta: NovaAposta) => {
  try {
    const novaAposta: Aposta = {
      ...aposta,
      id: Date.now(),
      data: new Date().toISOString()
    };

    if (!isApiAvailable) {
      const apostasLocais = await getLocalData('apostas') || [];
      apostasLocais.push(novaAposta);
      await setLocalData('apostas', apostasLocais);
      return novaAposta;
    }

    const response = await api.post('/apostas', aposta);
    const apostasLocais = await getLocalData('apostas') || [];
    apostasLocais.push(response.data);
    await setLocalData('apostas', apostasLocais);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Erro ao criar aposta');
    }
    throw error;
  }
};

export const listarApostas = async () => {
  try {
    if (!isApiAvailable) {
      return await getLocalData('apostas') || [];
    }

    const response = await api.get('/apostas');
    await setLocalData('apostas', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apostasLocais = await getLocalData('apostas');
      if (apostasLocais) {
        return apostasLocais;
      }
      throw new Error(error.response?.data?.message || 'Erro ao listar apostas');
    }
    throw error;
  }
};

export const listarApostasPorPeriodo = async (inicio: string, fim: string) => {
  try {
    if (!isApiAvailable) {
      const apostasLocais = await getLocalData('apostas') || [];
      return apostasLocais.filter((aposta: { data: string | number | Date; }) => {
        const dataAposta = new Date(aposta.data);
        return dataAposta >= new Date(inicio) && dataAposta <= new Date(fim);
      });
    }

    const response = await api.get(`/apostas/periodo?inicio=${inicio}&fim=${fim}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apostasLocais = await getLocalData('apostas');
      if (apostasLocais) {
        return apostasLocais.filter((aposta: { data: string | number | Date; }) => {
          const dataAposta = new Date(aposta.data);
          return dataAposta >= new Date(inicio) && dataAposta <= new Date(fim);
        });
      }
      throw new Error(error.response?.data?.message || 'Erro ao listar apostas por período');
    }
    throw error;
  }
};

export const logout = async () => {
  try {
    if (isApiAvailable) {
      await api.post('/auth/logout');
    }
  } catch (error) {
    console.error('Erro ao fazer logout na API:', error);
  } finally {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('usuarioLogado');
  }
};

export const isAuthenticated = async () => {
  const token = await AsyncStorage.getItem('token');
  return !!token;
};

export default {
  login,
  register,
  logout,
  isAuthenticated,
  criarAposta,
  listarApostas,
  listarApostasPorPeriodo,
  checkApiHealth
}; 