import { View, Text, ScrollView, Alert, Button, StyleSheet, Modal, TouchableOpacity, TextInput } from "react-native";
import React, { useState } from "react";
import { RouteProp, useNavigation, NavigationProp, useRoute } from "@react-navigation/native";
import { colors } from "../Styles/Colors";
import { fonts } from "../Styles/Fonts";
import { RFValue, RFPercentage } from "react-native-responsive-fontsize";
import { ProductDetailsData } from "../types/Product";
import { createOrGetChat } from "../services/chats/chatsService";
import { useAuthStore } from "../store/useAuthStore";
import { useStripe } from "@stripe/stripe-react-native";
import { createDirectPurchaseOperation, createOperationPaymentIntent, confirmOperationPayment } from "../services/Stripe/stripeService";
import ImageCarousel from "../components/ImageCarrousel";
import Ionicons from "react-native-vector-icons/Ionicons";
import { CardForm } from "@stripe/stripe-react-native";
import { createOfferOperation } from "../services/Offers/offerService";
import { SafeAreaView } from "react-native-safe-area-context";
type RootStackParamList = {
  ChatsPrivate: { chatId: number; userId: number };
  DetalleProducto: { producto: ProductDetailsData };
  DetailsOffer: { producto: ProductDetailsData };
  TradeOffer: { producto: ProductDetailsData }
};

type DetalleProductoRouteProp = RouteProp<RootStackParamList, "DetalleProducto">;

const DetalleProducto = () => {
  const { confirmPayment: stripeConfirmPayment } = useStripe();
  const route = useRoute<DetalleProductoRouteProp>();
  const { producto } = route.params;
  const userIdActual = Number(useAuthStore((state) => state.user?.id));
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const esMiProducto = producto.usuario?.id === userIdActual;

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
      console.log(producto)
      const { operationId: createdOperationId } = await createDirectPurchaseOperation(
        userIdActual,
        producto.usuario.id,
        producto.id,
        producto.precio
      );


      const { clientSecret } = await createOperationPaymentIntent(createdOperationId);


      const { error } = await stripeConfirmPayment(clientSecret, {
        paymentMethodType: "Card",
        paymentMethodData: {
          billingDetails: {
            name: useAuthStore.getState().user?.nombre || "Usuario",
            email: useAuthStore.getState().user?.email || "",
          },
        },
      });

      if (error) {
        Alert.alert("Error", error.message || "Error al procesar el pago");
        return;
      }


      await confirmOperationPayment(createdOperationId);

      Alert.alert(
        "Éxito",
        `¡Pago realizado correctamente!\nProducto: ${producto.nombre}\nComprador: ${useAuthStore.getState().user?.nombre}`
      );

      setPaymentModalVisible(false);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo procesar el pago");
    }
  };



  const handleOfertar = () => {
    setOfferModalVisible(true);
  };

  const enviarOfertaMonetaria = async () => {
    if (!offerAmount || isNaN(Number(offerAmount))) {
      Alert.alert("Error", "Introduce una cantidad válida");
      return;
    }

    try {

      const response = await createOfferOperation({
        requesterId: userIdActual,
        mainProductId: producto.id,
        moneyOffered: Number(offerAmount),
        offeredProductIds: []
      });

      if (response?.operationId) {
        Alert.alert("Éxito", `Oferta enviada: ${offerAmount} €`);
        setOfferAmount("");
        setOfferModalVisible(false);
      } else {
        Alert.alert("Error", "No se pudo enviar la oferta");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Ocurrió un error al enviar la oferta");
    }
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.fondo }}>
      <ScrollView style={styles.container}>
        <ImageCarousel
          images={
            producto.fotos?.length
              ? producto.fotos.map(f => f.url)
              : ["https://cdn-icons-png.flaticon.com/512/67/67353.png"]
          }
        />




        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.nombre}>{producto.nombre}</Text>
            <Text style={styles.propietario}>
              Propietario: {producto.usuario?.nombre || "Desconocido"}
            </Text>
          </View>
          <Text style={styles.precio}>
            {producto.precio ? `${producto.precio} €` : producto.tipo?.nombre}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.seccion}>Descripción</Text>
          <Text style={styles.descripcion}>
            {producto.descripcion || "Sin descripción"}
          </Text>
        </View>


        <View style={styles.card}>
          <Text style={styles.seccion}>Detalles</Text>
          <View style={styles.detalleRow}>
            <Ionicons name="pricetag-outline" size={RFValue(18)} color={colors.letraTitulos} />
            <Text style={styles.detalle}>Categoría: {producto.categoria.nombre}</Text>
          </View>
          <View style={styles.detalleRow}>
            <Ionicons name="cube-outline" size={RFValue(18)} color={colors.letraTitulos} />
            <Text style={styles.detalle}>Tipo: {producto.tipo.nombre}</Text>
          </View>
          <View style={styles.detalleRow}>
            <Ionicons name="information-circle-outline" size={RFValue(18)} color={colors.letraTitulos} />
            <Text style={styles.detalle}>Estado: {producto.estado.nombre}</Text>
          </View>
          <View style={styles.detalleRow}>
            <Ionicons name="checkmark-done-outline" size={RFValue(18)} color={colors.letraTitulos} />
            <Text style={styles.detalle}>
              Disponibilidad: {producto.disponibilidad ? "Disponible" : "No disponible"}
            </Text>
          </View>
          <View style={styles.detalleRow}>
            <Ionicons name="location-outline" size={RFValue(18)} color={colors.letraTitulos} />
            <Text style={styles.detalle}>
              Ubicación: {producto.ubicacion || "No especificada"}
            </Text>
          </View>
        </View>

        {!esMiProducto && (
          <View style={styles.buttonsContainer}>


            {(producto.tipo?.nombre === "Ambos" || producto.tipo?.nombre === "Intercambio") && (
              <>
                <Button
                  title="Ofertar producto"
                  onPress={handleOfertar}
                  color={colors.botonFondo}
                />
                <View style={{ height: RFPercentage(1) }} />
              </>
            )}

            {producto.tipo?.nombre !== "Intercambio" && (
              <>
                <Button
                  title="Comprar con tarjeta"
                  onPress={() => setPaymentModalVisible(true)}
                  color={colors.letraTitulos}
                />
                <View style={{ height: RFPercentage(1) }} />
              </>
            )}



            <Button
              title="Iniciar Chat"
              onPress={handleIniciarChat}
              color={colors.letraTitulos}
            />
          </View>
        )}



        <Modal
          visible={offerModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setOfferModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Elige acción</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setOfferModalVisible(false);
                  navigation.navigate("TradeOffer", { producto });
                }}
              >
                <Text style={styles.modalButtonText}>Intercambio</Text>
              </TouchableOpacity>
              {producto.tipo.nombre !== "Intercambio" && (
                <>
                  <TextInput
                    placeholder="Introduce tu oferta (€)"
                    keyboardType="numeric"
                    value={offerAmount}
                    onChangeText={setOfferAmount}
                    style={{
                      borderWidth: 1,
                      borderColor: colors.letraTitulos,
                      borderRadius: RFValue(8),
                      padding: RFPercentage(1.5),
                      marginVertical: RFPercentage(1)
                    }}
                  />

                  <Button
                    title="Enviar oferta"
                    onPress={enviarOfertaMonetaria}
                    color={colors.botonFondo}
                  />
                </>
              )}

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.letraSecundaria }]}
                onPress={() => setOfferModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>


        <Modal
          visible={paymentModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setPaymentModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Pago con tarjeta</Text>
              <CardForm
                onFormComplete={(cardDetails) => {

                  console.log(cardDetails);
                }}
                style={{
                  width: "100%",
                  height: RFPercentage(40),
                }}
                cardStyle={{
                  backgroundColor: colors.fondoSecundario,
                  textColor: "#000000",
                  placeholderColor: "#000000",
                  borderRadius: 2,
                  fontSize: fonts.medium,
                }}
              />

              <Button title="Pagar ahora" onPress={handleComprar} color={colors.letraTitulos} />
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.letraSecundaria }]}
                onPress={() => setPaymentModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </ScrollView >
    </SafeAreaView>
  );
};

export default DetalleProducto;





const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fondo,
    paddingHorizontal: RFPercentage(2),
    paddingTop: RFPercentage(2),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: RFPercentage(2),
  },
  nombre: {
    fontSize: RFPercentage(3),
    fontWeight: "bold",
    color: colors.letraTitulos,
  },
  propietario: {
    fontSize: RFPercentage(2),
    color: colors.letraSecundaria,
    marginTop: RFPercentage(0.5),
  },
  precio: {
    fontSize: RFPercentage(3),
    fontWeight: "bold",
    color: colors.letraTitulos,
  },
  card: {
    backgroundColor: colors.fondoSecundario,
    marginBottom: RFPercentage(2),
    padding: RFPercentage(2),
    borderRadius: RFValue(12),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: RFValue(5),
    elevation: 3,
  },
  seccion: {
    fontSize: RFPercentage(2.2),
    fontWeight: "bold",
    marginBottom: RFPercentage(1),
    color: colors.letraTitulos,
  },
  descripcion: {
    fontSize: RFPercentage(2),
    color: colors.infoLetra,
    lineHeight: RFValue(20),
  },
  detalleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: RFPercentage(1),
  },
  detalle: {
    fontSize: RFPercentage(2),
    color: colors.infoLetra,
    marginLeft: RFPercentage(1),
  },
  buttonsContainer: {
    marginBottom: RFPercentage(2),
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: colors.fondo,
    borderRadius: RFValue(12),
    padding: RFPercentage(3),
  },
  modalTitle: {
    fontSize: RFPercentage(2.5),
    fontWeight: "bold",
    marginBottom: RFPercentage(2),
    color: colors.letraTitulos,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: colors.botonFondo,
    paddingVertical: RFPercentage(1.5),
    borderRadius: RFValue(8),
    marginVertical: RFPercentage(1),
  },
  modalButtonText: {
    textAlign: "center",
    fontSize: RFPercentage(2),
    color: "#fff",
    fontWeight: "bold",
  },
  image: {
    width: "100%",
    height: RFPercentage(25),
    borderRadius: RFValue(10),
    marginBottom: RFPercentage(2),
  },
});
