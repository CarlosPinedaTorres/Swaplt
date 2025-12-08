import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useCallback, useState } from "react";
import { getMyChats } from "../services/chats/chatsService";
import { useAuthStore } from "../store/useAuthStore";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RFPercentage } from "react-native-responsive-fontsize";
import { fonts } from "../Styles/Fonts";
import Toast from "react-native-toast-message";

interface ChatItem {
  id: number;
  product: { id: number; nombre: string; imagen: string };
  otherUser: { id: number; nombre: string };
  lastMessage?: { id: number; content: string; sender: { id: number; nombre: string } };
  updatedAt: string;
}

const MyChats = () => {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      if (!user) return;

      const fetchChats = async () => {
        setLoading(true);
        try {
          const userId = Number(user.id);
          const data = await getMyChats(userId);
          setChats(data);
        } catch (err) {
          console.error("Error cargando chats:", err);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "No se pudieron cargar los chats",
          });
        } finally {
          setLoading(false);
        }
      };

      fetchChats();
    }, [user])
  );

  const goToChat = (chatId: number, otherUser: { id: number; nombre: string }) => {
    navigation.navigate("ChatsPrivate", { chatId, otherUser, userId: Number(user?.id) });
  };

  const renderItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => goToChat(item.id, item.otherUser)}
    >
      <Text style={styles.userName}>{item.otherUser.nombre}</Text>
      <Text style={styles.productName}>{item.product.nombre}</Text>
      <Text style={styles.lastMessage}>
        {item.lastMessage ? `${item.lastMessage.sender.nombre}: ${item.lastMessage.content}` : "Sin mensajes"}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#3D8DFF" />
        <Text style={{ marginTop: 10, color: "#666" }}>Cargando chats...</Text>
        <Toast />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: RFPercentage(2) }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes chats por el momento</Text>
          </View>
        }
      />
      <Toast />
    </SafeAreaView>
  );
};

export default MyChats;

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: RFPercentage(20),
  },
  emptyText: {
    fontSize: fonts.medium,
    color: "#777",
  },
  container: {
    flex: 1,
    padding: RFPercentage(2),
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  chatItem: {
    paddingVertical: RFPercentage(2),
    paddingHorizontal: RFPercentage(1),
    borderBottomWidth: 1,
    borderBottomColor: "#D1D1D1",
  },
  userName: {
    fontSize: fonts.medium,
    fontWeight: "700",
    color: "#000",
  },
  productName: {
    fontSize: fonts.normal,
    color: "#555",
    marginTop: RFPercentage(0.5),
  },
  lastMessage: {
    fontSize: fonts.small,
    color: "#777",
    marginTop: RFPercentage(1),
  },
});
