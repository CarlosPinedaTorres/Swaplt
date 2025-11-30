import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useChatStore } from "../store/useChatStore";
import { connectSocket, disconnectSocket } from "../services/chats/socket";
import { getMessages, sendMessage } from "../services/chats/chatsService";
import { useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { fonts } from "../Styles/Fonts";

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

      addMessage({
        ...message,
        sender: message.sender || { id: userId, nombre: "Tú" },
      });

      setInput("");
    } catch (err) {
      console.error("Error enviando mensaje:", err);
    }
  };


  const renderItem = ({ item }: any) => {
    const isMine = item.senderId === userId;

    return (
      <View
        style={[
          styles.messageBubble,
          isMine ? styles.myMessage : styles.otherMessage,
        ]}
      >
        {!isMine && (
          <Text style={styles.senderName}>
            {item.sender?.nombre || "Desconocido"}
          </Text>
        )}

        <Text style={styles.messageText}>{item.content}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
   
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{
            padding: RFPercentage(2),
            paddingBottom: RFPercentage(10),
          }}
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
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EFEFEF",
  },

  messageBubble: {
    maxWidth: "75%",
    padding: RFPercentage(1.5),
    borderRadius: RFPercentage(1.8),
    marginVertical: RFPercentage(0.5),
  },

  myMessage: {
    backgroundColor: "#3D8DFF",
    alignSelf: "flex-end",
  },

  otherMessage: {
    backgroundColor: "#FFF",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#DDD",
  },

  senderName: {
    fontSize: fonts.small,
    color: "#666",
    marginBottom: RFPercentage(0.5),
  },

  messageText: {
    fontSize: fonts.normal,
    color: "#000",
  },
inputContainer: {

  bottom: 0,
  left: 0,
  right: 0,
  flexDirection: "row",
  padding: RFPercentage(1.5),
  backgroundColor: "#FFF",
  borderTopWidth: 1,
  borderTopColor: "#DDD",
},


  input: {
    flex: 1,
    paddingHorizontal: RFPercentage(2),
    paddingVertical: RFPercentage(1.5),
    fontSize: fonts.normal,
    borderRadius: RFPercentage(2),
    borderWidth: 1,
    borderColor: "#CCC",
    backgroundColor: "#FFF",
    maxHeight: RFPercentage(20),
  },

  sendButton: {
    width: RFPercentage(6),
    height: RFPercentage(6),
    borderRadius: RFPercentage(3),
    backgroundColor: "#3D8DFF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: RFPercentage(1),
  },

  sendButtonText: {
    fontSize: RFValue(20),
    color: "white",
    fontWeight: "bold",
  },
});
