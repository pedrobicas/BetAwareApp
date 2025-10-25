import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import newsData from '../utils/newsData';
import NewsCard from '../components/NewsCard';

export default function NewsScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={newsData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NewsCard title={item.title} description={item.description} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 }
});
