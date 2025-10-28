import api from "../api"; 
import { connectSocket, getSocket } from "./socket";

export interface ChatData {
  id: number;
  user1Id: number;
  user2Id: number;
  productId: number;
}

export interface MessageData {
  id: number;
  chatId: number;
  senderId: number;
  content: string;
  createdAt: string;
  sender: { id: number; nombre: string };
}


export const createOrGetChat = async (user1Id: number, user2Id: number, productId: number): Promise<ChatData> => {
  const { data } = await api.post("/chats/create", { user1Id, user2Id, productId });
  connectSocket(data.id); 
  return data;
};

export const sendMessage = async (chatId: number, senderId: number, content: string): Promise<MessageData> => {
  const { data: message } = await api.post("/chats/sendMessages", { chatId, senderId, content });

  const socket = getSocket(chatId);
  if (socket && socket.connected) {
    socket.emit("sendMessage", message); 
  } else {
    console.warn(" Socket no conectado, mensaje no emitido");
  }

  return message;
};

export const getMessages = async (chatId: number): Promise<MessageData[]> => {
  const { data } = await api.get(`/chats/getMessages/${chatId}`);
  return data;
};

export const getMyChats = async (userId: number) => {
  const { data } = await api.get(`/chats/getMyChats/${userId}`);
  return data;
};