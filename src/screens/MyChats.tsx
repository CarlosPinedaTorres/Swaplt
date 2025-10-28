import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { getMyChats } from "../services/chats/chatsService"; 
import { useAuthStore } from "../store/useAuthStore"; 
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { connectSocket } from "../services/chats/socket";

interface ChatItem {
  id: number;
  product: { id: number; nombre: string; imagen: string };
  otherUser: { id: number; nombre: string };
  lastMessage?: { id: number; content: string; sender: { id: number; nombre: string } };
  updatedAt: string;
}

const MyChats = () => {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const { user } = useAuthStore(); 
  const navigation = useNavigation<any>(); 



useFocusEffect(
  useCallback(() => {
    if (!user) return;

    const fetchChats = async () => {
      try {
        const userId = Number(user.id);
        const data = await getMyChats(userId);
        setChats(data);
        console.log('Chats cargados:', data);
      } catch (err) {
        console.error('Error cargando chats:', err);
      }
    };

    fetchChats();
  }, [user])
);
const goToChat = (chatId: number, otherUser: { id: number; nombre: string }) => {
  navigation.navigate("ChatsPrivate", { chatId, otherUser, userId: Number(user?.id) });

};
  const renderItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity style={styles.chatItem}  onPress={() => goToChat(item.id, item.otherUser)}>
      <Text style={styles.userName}>{item.otherUser.nombre}</Text>
      <Text style={styles.productName}>{item.product.nombre}</Text>
      <Text style={styles.lastMessage}>
        {item.lastMessage ? `${item.lastMessage.sender.nombre}: ${item.lastMessage.content}` : "Sin mensajes"}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
  <FlatList
  data={chats}
  keyExtractor={(item) => item.id.toString()}
  renderItem={renderItem}
/>
    </View>
  );
};

export default MyChats;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  chatItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  userName: { fontWeight: "bold" },
  productName: { color: "#555" },
  lastMessage: { color: "#777", marginTop: 5 },
});
