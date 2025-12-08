import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useChatStore } from "../store/useChatStore";
import { connectSocket, disconnectSocket } from "../services/chats/socket";
import { getMessages, sendMessage, deleteChat } from "../services/chats/chatsService";
import { useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { fonts } from "../Styles/Fonts";
import Toast from "react-native-toast-message";

export default function Chats() {
  const route = useRoute<any>();
  const { chatId, userId } = route.params;
  const navigation = useNavigation();
  const { messages, setMessages, addMessage } = useChatStore();
  const [input, setInput] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setMessages([]);
    setLoading(true);

    const socket = connectSocket(chatId);

    const handleNewMessage = (message: any) => {
      addMessage(message);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
    };

    socket.off("newMessage");
    socket.on("newMessage", handleNewMessage);

    const fetchMessages = async () => {
      try {
        const data = await getMessages(chatId);
        setMessages(data);
      } catch (err) {
        console.error("Error cargando mensajes:", err);
      } finally {
        setLoading(false);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    };

    fetchMessages();

    return () => {
      socket.off("newMessage", handleNewMessage);
      disconnectSocket(chatId);
    };
  }, [chatId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      const message = await sendMessage(chatId, userId, input);
      addMessage({
        ...message,
        sender: message.sender || { id: userId, nombre: "Tú" },
      });
      setInput("");
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
    } catch (err) {
      console.error("Error enviando mensaje:", err);
    }
  };

  const handleDeleteChatConfirmed = async () => {
    try {
      await deleteChat(chatId);
      Toast.show({ type: "success", text1: "Chat eliminado" });
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Toast.show({ type: "error", text1: "Error", text2: "No se pudo eliminar el chat" });
    } finally {
      setDeleteModalVisible(false);
    }
  };

  const renderItem = ({ item }: any) => {
    const isMine = item.senderId === userId;
    return (
      <View style={[styles.messageBubble, isMine ? styles.myMessage : styles.otherMessage]}>
        {!isMine && <Text style={styles.senderName}>{item.sender?.nombre || "Desconocido"}</Text>}
        <Text style={styles.messageText}>{item.content}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3D8DFF" />
          <Text style={{ marginTop: 10, color: "#666" }}>Cargando mensajes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: RFPercentage(2), paddingBottom: RFPercentage(10) }}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Escribe un mensaje..."
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>

          <View style={styles.floatingDeleteButtonContainer}>
            <TouchableOpacity
              style={styles.floatingDeleteButton}
              onPress={() => setDeleteModalVisible(true)}
            >
              <Text style={styles.floatingDeleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          visible={deleteModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>¿Eliminar chat?</Text>
              <Text style={styles.modalText}>Esta acción no se puede deshacer.</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setDeleteModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={handleDeleteChatConfirmed}
                >
                  <Text style={styles.modalButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EFEFEF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  messageBubble: { maxWidth: "75%", padding: RFPercentage(1.5), borderRadius: RFPercentage(1.8), marginVertical: RFPercentage(0.5) },
  myMessage: { backgroundColor: "#3D8DFF", alignSelf: "flex-end" },
  otherMessage: { backgroundColor: "#FFF", alignSelf: "flex-start", borderWidth: 1, borderColor: "#DDD" },
  senderName: { fontSize: fonts.small, color: "#666", marginBottom: RFPercentage(0.5) },
  messageText: { fontSize: fonts.normal, color: "#000" },

  inputContainer: { flexDirection: "row", padding: RFPercentage(1.5), backgroundColor: "#FFF", borderTopWidth: 1, borderTopColor: "#DDD" },
  input: { flex: 1, paddingHorizontal: RFPercentage(2), paddingVertical: RFPercentage(1.5), fontSize: fonts.normal, borderRadius: RFPercentage(2), borderWidth: 1, borderColor: "#CCC", backgroundColor: "#FFF", maxHeight: RFPercentage(20) },
  sendButton: { width: RFPercentage(6), height: RFPercentage(6), borderRadius: RFPercentage(3), backgroundColor: "#3D8DFF", alignItems: "center", justifyContent: "center", marginLeft: RFPercentage(1) },
  sendButtonText: { fontSize: RFValue(20), color: "white", fontWeight: "bold" },

  floatingDeleteButtonContainer: { position: "absolute", bottom: RFPercentage(12), right: RFPercentage(3), zIndex: 10 },
  floatingDeleteButton: { width: RFPercentage(6), height: RFPercentage(6), borderRadius: RFPercentage(3), backgroundColor: "#FF4D4D", justifyContent: "center", alignItems: "center" },
  floatingDeleteButtonText: { fontSize: RFValue(20), color: "#FFF" },

  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "85%", backgroundColor: "#FFF", borderRadius: RFValue(12), padding: RFPercentage(3) },
  modalTitle: { fontSize: fonts.large, fontWeight: "bold", marginBottom: RFPercentage(1.5), textAlign: "center" },
  modalText: { fontSize: fonts.medium, marginBottom: RFPercentage(3), textAlign: "center" },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  modalButton: { flex: 1, padding: RFPercentage(1.5), borderRadius: RFValue(8), alignItems: "center", marginHorizontal: RFPercentage(0.5) },
  cancelButton: { backgroundColor: "#CCC" },
  deleteButton: { backgroundColor: "#FF4D4D" },
  modalButtonText: { color: "#FFF", fontWeight: "bold", fontSize: fonts.medium },
});
