import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { IconSymbol } from '../components/ui/IconSymbol';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';
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

export default function DashboardScreen() {
  const [usuario, setUsuario] = useState<any>(null);
  const [apostas, setApostas] = useState<Aposta[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalApostas, setTotalApostas] = useState(0);
  const [valorTotal, setValorTotal] = useState(0);
  const [valorPerdido, setValorPerdido] = useState(0);
  const [taxaSucesso, setTaxaSucesso] = useState(0);

  const colorScheme = useColorScheme() ?? 'light';
  const tintColor = Colors[colorScheme].tint;

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar dados do usuário
      const userData = await AsyncStorage.getItem('usuarioLogado');
      if (userData) {
        setUsuario(JSON.parse(userData));
      }

      // Carregar apostas
      const dados = await api.listarApostas();
      // Garantir que dados seja sempre um array
      const apostasArray = Array.isArray(dados) ? dados : [];
      setApostas(apostasArray);
      calcularEstatisticas(apostasArray);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao carregar os dados');
    } finally {
      setLoading(false);
    }
  };

  // Atualiza os dados quando a tela recebe foco
  useFocusEffect(
    React.useCallback(() => {
      carregarDados();
    }, [])
  );

  const calcularEstatisticas = (apostas: Aposta[]) => {
    try {
      const total = apostas.length;
      const totalValor = apostas.reduce((acc, aposta) => acc + aposta.valor, 0);
      const valorPerdidoTotal = apostas
        .filter(aposta => aposta.resultado === 'PERDEU')
        .reduce((acc, aposta) => acc + aposta.valor, 0);
      const taxa = total > 0 
        ? (apostas.filter(aposta => aposta.resultado === 'GANHOU').length / total) * 100 
        : 0;

      setTotalApostas(total);
      setValorTotal(totalValor);
      setValorPerdido(valorPerdidoTotal);
      setTaxaSucesso(taxa);
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      router.replace('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao fazer logout');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>BetAware</Text>
        <Text style={styles.welcomeText}>
          Bem-vindo, {usuario?.nome?.split(' ')[0] || 'usuário'} ⚽
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Text style={styles.statIconText}>📊</Text>
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>Total de Apostas</Text>
            <Text style={styles.statValue}>{totalApostas}</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Text style={styles.statIconText}>💰</Text>
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>Valor Total</Text>
            <Text style={styles.statValue}>R$ {valorTotal.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Text style={styles.statIconText}>📉</Text>
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>Valor Perdido</Text>
            <Text style={styles.statValue}>R$ {valorPerdido.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Text style={styles.statIconText}>🎯</Text>
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>Taxa de Sucesso</Text>
            <Text style={styles.statValue}>{taxaSucesso.toFixed(1)}%</Text>
          </View>
        </View>
      </View>

      <View style={styles.recentBets}>
        <Text style={styles.sectionTitle}>Apostas Recentes</Text>
        
        {apostas.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma aposta encontrada</Text>
        ) : (
          apostas.slice(0, 5).map((aposta) => (
            <View key={aposta.id} style={styles.betCard}>
              <View style={styles.betHeader}>
                <Text style={styles.game}>{aposta.jogo}</Text>
                <Text style={styles.date}>
                  {new Date(aposta.data).toLocaleString()}
                </Text>
              </View>
              <View style={styles.betDetails}>
                <Text style={styles.value}>R$ {aposta.valor.toFixed(2)}</Text>
                <Text style={[
                  styles.result,
                  aposta.resultado === 'GANHOU' ? styles.resultGanhou : styles.resultPerdeu
                ]}>
                  {aposta.resultado}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.newBetButton]}
          onPress={() => router.push('/(tabs)/apostas')}
        >
          <IconSymbol name="sportscourt" color="#fff" size={20} />
          <Text style={styles.actionButtonText}>Nova Aposta</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.logoutButton]}
          onPress={logout}
        >
          <IconSymbol name="house.fill" color="#fff" size={20} />
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0a5c2c',
    marginBottom: 8
  },
  welcomeText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    ...shadows.medium
  },
  statIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center'
  },
  statIconText: {
    fontSize: 24
  },
  statInfo: {
    flex: 1
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  recentBets: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    ...shadows.medium
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20
  },
  betCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12
  },
  betHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  game: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333'
  },
  date: {
    fontSize: 12,
    color: '#666'
  },
  betDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333'
  },
  result: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  resultGanhou: {
    backgroundColor: '#e6f4ea',
    color: '#1e7e34'
  },
  resultPerdeu: {
    backgroundColor: '#fbe9e7',
    color: '#d32f2f'
  },
  actions: {
    padding: 20,
    gap: 10,
    marginBottom: Platform.OS === 'ios' ? 85 : 60
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 8
  },
  newBetButton: {
    backgroundColor: '#0a5c2c',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500'
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500'
  }
});