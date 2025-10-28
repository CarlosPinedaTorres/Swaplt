import io, { Socket } from "socket.io-client";

const sockets: Record<number, Socket> = {}; 

export const connectSocket = (chatId: number): Socket => {
  if (sockets[chatId]) return sockets[chatId];

  const socket = io("http://192.168.18.27:3000", { transports: ["websocket"] });
  
  socket.on("connect", () => {
    console.log(`🔌 Conectado al socket del chat ${chatId}`);
    socket.emit("joinChat", chatId); 
  });

  sockets[chatId] = socket;
  return socket;
};

export const getSocket = (chatId?: number): Socket | null => {
  if (chatId) return sockets[chatId] || null;
  return Object.values(sockets)[0] || null;
};

export const disconnectSocket = (chatId?: number) => {
  if (chatId && sockets[chatId]) {
    sockets[chatId].disconnect();
    delete sockets[chatId];
  } else {
    Object.values(sockets).forEach(s => s.disconnect());
    Object.keys(sockets).forEach(key => delete sockets[Number(key)]);
  }
};
