import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet } from "react-native";
import { useChatStore } from "../store/useChatStore";
import { connectSocket, disconnectSocket } from "../services/chats/socket";
import { getMessages, sendMessage } from "../services/chats/chatsService";
import { useRoute } from "@react-navigation/native";

export default function Chats() {
  const route = useRoute<any>();
  const { chatId, userId } = route.params;
  const { messages, setMessages, addMessage } = useChatStore();
  const [input, setInput] = useState("");

useEffect(() => {
  setMessages([]); 

  const socket = connectSocket(chatId);

  const handleNewMessage = (message: any) => {
    addMessage(message); 
  };

  socket.off("newMessage");
  socket.on("newMessage", handleNewMessage);

  const fetchMessages = async () => {
    try {
      const data = await getMessages(chatId);
      setMessages(data);
    } catch (err) {
      console.error("Error cargando mensajes:", err);
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

      // Asegurarse que sender esté definido para renderizar
      addMessage({
        ...message,
        sender: message.sender || { id: userId, nombre: "Tú" },
      });

      setInput("");
    } catch (err) {
      console.error("Error enviando mensaje:", err);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={{ fontWeight: item.senderId === userId ? "bold" : "normal" }}>
              {item.sender?.nombre || "Desconocido"}: {item.content}
            </Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Escribe un mensaje..."
        />
        <Button title="Enviar" onPress={handleSend} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  messageContainer: { marginVertical: 5 },
  inputContainer: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  input: { flex: 1, borderWidth: 1, padding: 8, borderRadius: 5, marginRight: 10 },
});
