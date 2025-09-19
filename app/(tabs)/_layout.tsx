import { Tabs } from 'expo-router';
import { IconSymbol } from '../components/ui/IconSymbol';
import { useColorScheme } from '../hooks/useColorScheme';
import { Colors } from '../constants/Colors';
import { Platform } from 'react-native';

export default function TabsLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const tintColor = Colors[colorScheme].tint;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme].background,
          borderTopWidth: 1,
          borderTopColor: colorScheme === 'dark' ? '#2A2A2A' : '#E5E5E5',
          height: Platform.OS === 'ios' ? 85 : 60,
          paddingBottom: Platform.OS === 'ios' ? 30 : 8,
          paddingTop: 8,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          shadowOpacity: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        headerStyle: {
          backgroundColor: Colors[colorScheme].background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: Colors[colorScheme].text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen 
        name="dashboard" 
        options={{ 
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="chart.bar" color={color} size={28} />
          ),
          headerTitle: 'Painel Principal'
        }} 
      />
      <Tabs.Screen 
        name="apostas" 
        options={{ 
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="sportscourt" color={color} size={28} />
          ),
          headerTitle: 'Nova Aposta'
        }} 
      />
      <Tabs.Screen 
        name="historico" 
        options={{ 
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="clock" color={color} size={28} />
          ),
          headerTitle: 'Histórico de Apostas'
        }} 
      />
      <Tabs.Screen 
        name="relatorio" 
        options={{ 
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="doc.text" color={color} size={28} />
          ),
          headerTitle: 'Relatórios'
        }} 
      />
    </Tabs>
  );
}
