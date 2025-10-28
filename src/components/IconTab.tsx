import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface IconTabProps {
  routeName: string;
  color: string;
  size: number;
}

const icons: Record<string, string> = {
  Inicio: 'home-outline',
  Perfil: 'person-outline',
  Ofertas: 'pricetag-outline',
  Chats: 'chatbubble-outline',
};

export default function IconTab({ routeName, color, size }: IconTabProps) {
  const iconName = icons[routeName] || 'help-circle-outline'; 
  return <Ionicons name={iconName} size={size} color={color} />;
}
