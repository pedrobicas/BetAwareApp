import { useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import api from '../service/api';

interface Aposta {
  id: number;
  categoria: string;
  jogo: string;
  valor: number;
  resultado: string;
  data: string;
}

export default function HistoricoScreen() {
  const [historico, setHistorico] = useState<Aposta[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [resultadoFiltro, setResultadoFiltro] = useState('');
  const [totalApostas, setTotalApostas] = useState(0);
  const [valorTotal, setValorTotal] = useState(0);
  const [valorPerdido, setValorPerdido] = useState(0);
  const [taxaSucesso, setTaxaSucesso] = useState(0);

  const carregarHistorico = async () => {
    try {
      const apostas = await api.listarApostas();
      setHistorico(apostas);
      calcularEstatisticas(apostas);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  // Atualiza os dados quando a tela recebe foco
  useFocusEffect(
    React.useCallback(() => {
      carregarHistorico();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarHistorico();
    setRefreshing(false);
  };

  const filtrarApostas = () => {
    let apostasFiltradas = [...historico];

    if (dataInicio) {
      const inicio = new Date(dataInicio);
      apostasFiltradas = apostasFiltradas.filter(aposta => 
        new Date(aposta.data) >= inicio
      );
    }

    if (dataFim) {
      const fim = new Date(dataFim);
      apostasFiltradas = apostasFiltradas.filter(aposta => 
        new Date(aposta.data) <= fim
      );
    }

    if (resultadoFiltro) {
      apostasFiltradas = apostasFiltradas.filter(aposta => 
        aposta.resultado === resultadoFiltro
      );
    }

    calcularEstatisticas(apostasFiltradas);
  };

  const calcularEstatisticas = (apostas: Aposta[]) => {
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
  };

  useEffect(() => {
    carregarHistorico();
  }, []);

  useEffect(() => {
    filtrarApostas();
  }, [dataInicio, dataFim, resultadoFiltro]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Histórico de Apostas</Text>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total de Apostas</Text>
          <Text style={styles.summaryValue}>{totalApostas}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Valor Total</Text>
          <Text style={styles.summaryValue}>R$ {valorTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Valor Perdido</Text>
          <Text style={styles.summaryValue}>R$ {valorPerdido.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Taxa de Sucesso</Text>
          <Text style={styles.summaryValue}>{taxaSucesso.toFixed(1)}%</Text>
        </View>
      </View>

      {historico.length === 0 ? (
        <Text style={styles.empty}>Nenhuma aposta registrada ainda.</Text>
      ) : (
        <FlatList
          data={historico.reverse()}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.categoria}>{item.categoria}</Text>
                <Text style={styles.data}>
                  {new Date(item.data).toLocaleString()}
                </Text>
              </View>
              <Text style={styles.jogo}>{item.jogo}</Text>
              <View style={styles.cardDetails}>
                <Text style={styles.valor}>R$ {item.valor.toFixed(2)}</Text>
                <Text style={[
                  styles.resultado,
                  { color: item.resultado === 'GANHOU' ? 'green' : 'red' }
                ]}>
                  {item.resultado}
                </Text>
              </View>
            </View>
          )}
        />
      )}
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
    color: '#333'
  },
  summary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  empty: { 
    textAlign: 'center', 
    marginTop: 40, 
    fontStyle: 'italic',
    color: '#666'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee'
  },
  cardHeader: {
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
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333'
  },
  cardDetails: {
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
    fontWeight: 'bold'
  }
});
