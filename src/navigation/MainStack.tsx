import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import AddProduct from '../screens/AddProduct';
import DetalleProducto from '../screens/DetalleProducto';
import Chats from '../screens/Chats';
const Stack=createNativeStackNavigator(); 

const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown:false}}>
        <Stack.Screen name="MainTabs" component={MainTabs}/>
        <Stack.Screen name="AddProduct" component={AddProduct}/>
        <Stack.Screen name="DetalleProducto" component={DetalleProducto}/>
         <Stack.Screen name="ChatsPrivate" component={Chats}/>
    </Stack.Navigator>
  )
}

export default MainStack