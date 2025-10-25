import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NewsCard({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f8f8f8'
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 16
  }
});
