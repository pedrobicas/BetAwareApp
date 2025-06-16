import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo!</Text>
      <Text style={styles.subtitle}>Comece a refletir sobre suas apostas.</Text>
      <Button title="Ler notícias sobre vício em apostas" onPress={() => router.push('/news')} />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 20
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      textAlign: 'center'
    },
    subtitle: {
      fontSize: 16,
      marginVertical: 20,
      textAlign: 'center'
    }
  });
  
