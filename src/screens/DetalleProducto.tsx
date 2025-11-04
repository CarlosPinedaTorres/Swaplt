import { View, Text, Image, StyleSheet, ScrollView, Alert, Button } from "react-native";
import React, { useState } from "react";
import { RouteProp, useNavigation, NavigationProp, useRoute } from "@react-navigation/native";
import { colors } from "../Styles/Colors";
import { ProductDetailsData } from "../types/Product";
import { createOrGetChat } from "../services/chats/chatsService";
import { useAuthStore } from "../store/useAuthStore";
import { useStripe, CardField } from "@stripe/stripe-react-native";
import { createPaymentIntent, confirmPayment } from "../services/Stripe/stripeService";

type RootStackParamList = {
  ChatsPrivate: { chatId: number; userId: number };
  DetalleProducto: { producto: ProductDetailsData };
   DetailsOffer: { producto: ProductDetailsData }; 
};

type DetalleProductoRouteProp = RouteProp<RootStackParamList, "DetalleProducto">;

const DetalleProducto = () => {
  const { confirmPayment: stripeConfirmPayment } = useStripe();
  const route = useRoute<DetalleProductoRouteProp>();
  const { producto } = route.params;
  const userIdActual = Number(useAuthStore((state) => state.user?.id));
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [cardComplete, setCardComplete] = useState(false);

  const handleIniciarChat = async () => {
    try {
      const chat = await createOrGetChat(userIdActual, producto.userId, producto.id);
      navigation.navigate("ChatsPrivate", { chatId: chat.id, userId: userIdActual });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo iniciar el chat");
    }
  };

  const handleComprar = async () => {
    if (!producto.precio) return;
    try {
      const { clientSecret, transactionId } = await createPaymentIntent(
        producto.precio * 100,
        "eur",
        userIdActual,
        producto.userId,
        producto.id
      );

      const { error, paymentIntent } = await stripeConfirmPayment(clientSecret, {
        paymentMethodType: "Card",
      });

      if (error) {
        Alert.alert("Error", error.message || "Error al procesar el pago");
        return;
      }

      await confirmPayment(transactionId);
      Alert.alert("Éxito", "¡Pago realizado correctamente!");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo procesar el pago");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={require("../assets/images/defaultProfile.png")}
        style={styles.image}
      />

      <Text style={styles.nombre}>{producto.nombre}</Text>
      <Text style={styles.precio}>
        {producto.precio ? `${producto.precio} €` : "Sin precio"}
      </Text>

      <Text style={styles.seccion}>Descripción</Text>
      <Text style={styles.descripcion}>
        {producto.descripcion || "Sin descripción"}
      </Text>

      <Text style={styles.seccion}>Detalles</Text>
      <Text style={styles.detalle}>Categoría: {producto.categoria.nombre}</Text>
      <Text style={styles.detalle}>Tipo: {producto.tipo.nombre}</Text>
      <Text style={styles.detalle}>Estado: {producto.estado.nombre}</Text>
      <Text style={styles.detalle}>
        Disponibilidad: {producto.disponibilidad ? "Disponible" : "No disponible"}
      </Text>
      <Text style={styles.detalle}>
        Ubicación: {producto.ubicacion || "No especificada"}
      </Text>
<View style={{ marginTop: 20 }}>
  <Button
    title="Ofertar producto"
    onPress={() =>
      navigation.navigate("DetailsOffer", { producto: producto })
    }
  />
</View>
      <View style={{ marginTop: 20 }}>
        <Button title="Iniciar Chat" onPress={handleIniciarChat} />
      </View>

     
      {producto.precio && (
        <View style={{ marginTop: 30 }}>
          <Text style={styles.seccion}>Pago con tarjeta</Text>
  <CardField
  postalCodeEnabled={false}
  placeholders={{ number: "4242 4242 4242 4242" }}
  style={{ width: "100%", height: 50, marginVertical: 20 }}
  onCardChange={(cardDetails) => {
    setCardComplete(cardDetails.complete); 
  }}
/>
    <Button
  title="Comprar ahora"
  onPress={handleComprar}
  disabled={!cardComplete} 
/>

        </View>
      )}
    </ScrollView>
  );
};

export default DetalleProducto;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fondo,
    padding: 16,
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 15,
  },
  nombre: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.letraSecundaria,
    marginBottom: 5,
  },
  precio: {
    fontSize: 18,
    color: colors.infoLetra,
    marginBottom: 10,
  },
  seccion: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 15,
    color: colors.letraSecundaria,
  },
  descripcion: {
    fontSize: 14,
    color: colors.infoLetra,
    marginTop: 4,
  },
  detalle: {
    fontSize: 14,
    color: colors.infoLetra,
    marginTop: 3,
  },
});
