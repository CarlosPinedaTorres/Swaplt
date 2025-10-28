import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Inicio from '../screens/Inicio';
import Perfil from '../screens/Perfil';
import Ofertas from '../screens/Ofertas';
import Chats from '../screens/Chats';
import IconTab from '../components/IconTab';
import MyChats from '../screens/MyChats';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <IconTab routeName={route.name} color={color} size={size} />
        ),
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Inicio" component={Inicio} />
      <Tab.Screen name="Perfil" component={Perfil} />
      <Tab.Screen name="Ofertas" component={Ofertas} />
      <Tab.Screen name="Chats" component={MyChats} />
    </Tab.Navigator>
  );
}
