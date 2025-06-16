import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import  api  from '../services/api';

const width = Dimensions.get('window').width - 40;

interface Aposta {
  id: number;
  jogo: string;
  valor: number;
  resultado: string;
  data: string;
}

export default function RelatorioScreen() {
  const [ganhos, setGanhos] = useState(0);
  const [perdas, setPerdas] = useState(0);
  const [totalApostas, setTotalApostas] = useState(0);
  const [historicoFiltrado, setHistoricoFiltrado] = useState<Aposta[]>([]);
  const [periodo, setPeriodo] = useState('todos');

  const calcularPeriodo = (dias: number) => {
    const fim = new Date().toISOString();
    const inicio = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString();
    return { inicio, fim };
  };

  const carregarDados = async () => {
    try {
      let apostas: Aposta[] = [];
      
      if (periodo === '7') {
        const { inicio, fim } = calcularPeriodo(7);
        apostas = await api.listarApostasPorPeriodo(inicio, fim);
      } else if (periodo === '30') {
        const { inicio, fim } = calcularPeriodo(30);
        apostas = await api.listarApostasPorPeriodo(inicio, fim);
      } else {
        apostas = await api.listarApostas();
      }

      let ganhosTotais = 0;
      let perdasTotais = 0;

      apostas.forEach((aposta) => {
        if (aposta.resultado === 'GANHOU') ganhosTotais += aposta.valor;
        else perdasTotais += aposta.valor;
      });

      setGanhos(ganhosTotais);
      setPerdas(perdasTotais);
      setTotalApostas(apostas.length);
      setHistoricoFiltrado(apostas);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      carregarDados();
    }, [periodo])
  );

  const lucro = ganhos - perdas;

  const apostasPorJogo = historicoFiltrado.reduce((acc, aposta) => {
    acc[aposta.jogo] = (acc[aposta.jogo] || 0) + aposta.valor;
    return acc;
  }, {} as Record<string, number>);

  const jogos = Object.keys(apostasPorJogo);
  const valores = Object.values(apostasPorJogo);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 Relatório Geral</Text>

      <View style={styles.filtros}>
        <TouchableOpacity onPress={() => setPeriodo('7')} style={styles.botaoFiltro}>
          <Text>Últimos 7 dias</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setPeriodo('30')} style={styles.botaoFiltro}>
          <Text>Últimos 30 dias</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setPeriodo('todos')} style={styles.botaoFiltro}>
          <Text>Todos</Text>
        </TouchableOpacity>
      </View>

      {totalApostas > 0 && (
        <PieChart
          data={[
            { name: 'Ganhos', population: ganhos, color: 'green', legendFontColor: '#333', legendFontSize: 14 },
            { name: 'Perdas', population: perdas, color: 'red', legendFontColor: '#333', legendFontSize: 14 }
          ]}
          width={width}
          height={220}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            decimalPlaces: 2
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      )}

      <View style={styles.card}>
        <Text style={styles.label}>Total de apostas:</Text>
        <Text style={styles.value}>{totalApostas}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Total ganho:</Text>
        <Text style={[styles.value, { color: 'green' }]}>R$ {ganhos.toFixed(2)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Total perdido:</Text>
        <Text style={[styles.value, { color: 'red' }]}>R$ {perdas.toFixed(2)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Lucro líquido:</Text>
        <Text style={[styles.value, { color: lucro >= 0 ? 'green' : 'red' }]}>R$ {lucro.toFixed(2)}</Text>
      </View>

      {jogos.length > 0 && (
        <>
          <Text style={[styles.title, { fontSize: 18 }]}>🏆 Apostas por Jogo</Text>
          <BarChart
            data={{
              labels: jogos,
              datasets: [{ data: valores }]
            }}
            width={width}
            height={250}
            chartConfig={{
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              labelColor: () => '#000'
            }}
            verticalLabelRotation={45}
            fromZero yAxisLabel={''} yAxisSuffix={''}          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  filtros: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  botaoFiltro: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#f5f5f5'
  },
  label: { fontSize: 16 },
  value: { fontSize: 20, fontWeight: 'bold', marginTop: 5 }
});
