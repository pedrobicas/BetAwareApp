import { useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import api from '../service/api';
import { shadows } from '../utils/shadows';

interface Aposta {
  id: number;
  categoria: string;
  jogo: string;
  valor: number;
  resultado: string;
  data: string;
}

const categorias = [
  {
    nome: 'Futebol',
    jogos: [
      'Flamengo x Vasco',
      'Palmeiras x Corinthians',
      'São Paulo x Santos',
      'Grêmio x Internacional'
    ]
  },
  {
    nome: 'Basquete',
    jogos: [
      'Lakers x Warriors',
      'Celtics x Heat',
      'Bulls x Knicks',
      'Mavericks x Rockets'
    ]
  },
  {
    nome: 'Tênis',
    jogos: [
      'Djokovic x Alcaraz',
      'Nadal x Medvedev',
      'Federer x Murray',
      'Sinner x Tsitsipas'
    ]
  }
];

export default function ApostasScreen() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [jogosFiltrados, setJogosFiltrados] = useState<string[]>([]);
  const [aposta, setAposta] = useState({
    categoria: '',
    jogo: '',
    valor: '',
    resultado: ''
  });
  const [apostas, setApostas] = useState<Aposta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    carregarApostas();
  }, []);

  const carregarApostas = async () => {
    try {
      const dados = await api.listarApostas();
      setApostas(dados);
    } catch (error) {
      console.error('Erro ao carregar apostas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as apostas');
    }
  };

  // Atualiza os dados quando a tela recebe foco
  useFocusEffect(
    React.useCallback(() => {
      carregarApostas();
    }, [])
  );

  const onCategoriaChange = (categoria: string) => {
    setCategoriaSelecionada(categoria);
    setAposta(prev => ({ ...prev, categoria, jogo: '' }));
    const jogos = categorias.find(cat => cat.nome === categoria)?.jogos || [];
    setJogosFiltrados(jogos);
  };

  const simularAposta = async () => {
    if (!aposta.categoria || !aposta.jogo || !aposta.valor || !aposta.resultado) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const novaAposta = {
        categoria: aposta.categoria,
        jogo: aposta.jogo,
        valor: parseFloat(aposta.valor),
        resultado: aposta.resultado,
        data: new Date().toISOString()
      };

      await api.criarAposta(novaAposta);
      Alert.alert('Sucesso', 'Aposta registrada com sucesso!');
      
      setAposta({
        categoria: '',
        jogo: '',
        valor: '',
        resultado: ''
      });
      setCategoriaSelecionada('');
      setJogosFiltrados([]);
      
      carregarApostas();
    } catch (error) {
      setError('Erro ao registrar aposta. Tente novamente.');
      Alert.alert('Erro', 'Não foi possível registrar a aposta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Nova Aposta</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Categoria:</Text>
          <View style={styles.categoriasContainer}>
            {categorias.map((categoria) => (
              <TouchableOpacity
                key={categoria.nome}
                style={[
                  styles.categoriaButton,
                  categoriaSelecionada === categoria.nome && styles.categoriaButtonSelected
                ]}
                onPress={() => onCategoriaChange(categoria.nome)}
              >
                <Text style={[
                  styles.categoriaButtonText,
                  categoriaSelecionada === categoria.nome && styles.categoriaButtonTextSelected
                ]}>
                  {categoria.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {categoriaSelecionada && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Jogo:</Text>
            <View style={styles.jogosContainer}>
              {jogosFiltrados.map((jogo) => (
                <TouchableOpacity
                  key={jogo}
                  style={[
                    styles.jogoButton,
                    aposta.jogo === jogo && styles.jogoButtonSelected
                  ]}
                  onPress={() => setAposta(prev => ({ ...prev, jogo }))}
                >
                  <Text style={[
                    styles.jogoButtonText,
                    aposta.jogo === jogo && styles.jogoButtonTextSelected
                  ]}>
                    {jogo}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Valor da Aposta (R$):</Text>
          <TextInput
            style={styles.input}
            value={aposta.valor}
            onChangeText={(text) => setAposta(prev => ({ ...prev, valor: text }))}
            keyboardType="numeric"
            placeholder="0.00"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Resultado:</Text>
          <View style={styles.resultadoContainer}>
            <TouchableOpacity
              style={[
                styles.resultadoButton,
                aposta.resultado === 'GANHOU' && styles.resultadoButtonSelected
              ]}
              onPress={() => setAposta(prev => ({ ...prev, resultado: 'GANHOU' }))}
            >
              <Text style={[
                styles.resultadoButtonText,
                aposta.resultado === 'GANHOU' && styles.resultadoButtonTextSelected
              ]}>
                Ganhou
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.resultadoButton,
                aposta.resultado === 'PERDEU' && styles.resultadoButtonSelected
              ]}
              onPress={() => setAposta(prev => ({ ...prev, resultado: 'PERDEU' }))}
            >
              <Text style={[
                styles.resultadoButtonText,
                aposta.resultado === 'PERDEU' && styles.resultadoButtonTextSelected
              ]}>
                Perdeu
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={simularAposta}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Fazer Aposta</Text>
          )}
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Histórico de Apostas</Text>
        {apostas.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma aposta registrada ainda.</Text>
        ) : (
          apostas.map((aposta) => (
            <View key={aposta.id} style={styles.apostaItem}>
              <View style={styles.apostaHeader}>
                <Text style={styles.categoria}>{aposta.categoria}</Text>
                <Text style={styles.data}>
                  {new Date(aposta.data).toLocaleString()}
                </Text>
              </View>
              <Text style={styles.jogo}>{aposta.jogo}</Text>
              <View style={styles.apostaDetails}>
                <Text style={styles.valor}>R$ {aposta.valor.toFixed(2)}</Text>
                <Text style={[
                  styles.resultado,
                  aposta.resultado === 'GANHOU' ? styles.resultadoGanhou : styles.resultadoPerdeu
                ]}>
                  {aposta.resultado}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    ...shadows.medium
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333'
  },
  formGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666'
  },
  categoriasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  categoriaButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  categoriaButtonSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff'
  },
  categoriaButtonText: {
    color: '#666'
  },
  categoriaButtonTextSelected: {
    color: '#fff'
  },
  jogosContainer: {
    gap: 10
  },
  jogoButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  jogoButtonSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3'
  },
  jogoButtonText: {
    color: '#333'
  },
  jogoButtonTextSelected: {
    color: '#2196f3',
    fontWeight: '500'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16
  },
  resultadoContainer: {
    flexDirection: 'row',
    gap: 10
  },
  resultadoButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center'
  },
  resultadoButtonSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3'
  },
  resultadoButtonText: {
    color: '#333'
  },
  resultadoButtonTextSelected: {
    color: '#2196f3',
    fontWeight: '500'
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc'
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500'
  },
  errorText: {
    color: '#dc3545',
    marginTop: 10,
    textAlign: 'center'
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic'
  },
  apostaItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 15
  },
  apostaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  categoria: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  data: {
    fontSize: 12,
    color: '#666'
  },
  jogo: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333'
  },
  apostaDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  valor: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333'
  },
  resultado: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  resultadoGanhou: {
    backgroundColor: '#e6f4ea',
    color: '#1e7e34'
  },
  resultadoPerdeu: {
    backgroundColor: '#fbe9e7',
    color: '#d32f2f'
  }
}); 