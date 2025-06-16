import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const noticias = [
  {
    titulo: 'Estudos revelam aumento de vício em apostas entre jovens',
    resumo: 'A popularização dos apps de aposta contribuiu para o vício silencioso entre adultos e adolescentes.'
  },
  {
    titulo: 'Histórias reais de superação',
    resumo: 'Conheça pessoas que abandonaram o vício em apostas e retomaram o controle da própria vida.'
  },
  {
    titulo: '5 sinais de que você pode estar apostando demais',
    resumo: 'Descubra indícios de que a aposta deixou de ser diversão e se tornou um risco.'
  },
  {
    titulo: 'Dicas práticas para se afastar das apostas',
    resumo: 'Técnicas simples de controle emocional e financeiro para quem quer parar de apostar.'
  }
];

export default function NoticiasScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📰 Notícias sobre Vício em Apostas</Text>

      {noticias.map((noticia, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitulo}>{noticia.titulo}</Text>
          <Text style={styles.cardResumo}>{noticia.resumo}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#ffffff' },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#0a5c2c'
  },
  card: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#0a5c2c'
  },
  cardTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#222'
  },
  cardResumo: {
    fontSize: 14,
    color: '#444'
  }
});
