import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import AddProduct from '../screens/AddProduct';
import DetalleProducto from '../screens/DetalleProducto';
import DetailsOffer from '../screens/DetailsOffer';
import Chats from '../screens/Chats';
import EditarPerfil from '../screens/EditarPerfil';
import EditarProducto from '../screens/EditarProducto';
const Stack = createNativeStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="AddProduct" component={AddProduct} />
      <Stack.Screen name="DetalleProducto" component={DetalleProducto} />
      <Stack.Screen name="ChatsPrivate" component={Chats} />
      <Stack.Screen name="DetailsOffer" component={DetailsOffer} />
      <Stack.Screen name="EditarPerfil" component={EditarPerfil} />
<Stack.Screen name="EditarProducto" component={EditarProducto} />
    </Stack.Navigator>
  )
}

export default MainStack