import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ScrollView,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useAuthStore } from "../store/useAuthStore";
import {
  acceptOperation,
  rejectOperation,
  getOperationById,
} from "../services/Offers/offerService";
import {
  createOperationPaymentIntent,
  confirmOperationPayment,
} from "../services/Stripe/stripeService";
import { colors } from "../Styles/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { fonts } from "../Styles/Fonts";
import { CardForm, useStripe } from "@stripe/stripe-react-native";

const DetailsOffer = () => {
  const route = useRoute();
  const { offer } = route.params as any;
  const user = useAuthStore((state) => state.user);

  const [currentOffer, setCurrentOffer] = useState(offer);
  const isSeller = currentOffer.receiverId === user?.id;
  const isBuyer = currentOffer.requesterId === user?.id;

  const { confirmPayment: stripeConfirmPayment } = useStripe();
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  const refreshOffer = async () => {
    try {
      const updated = await getOperationById(currentOffer.id);
      setCurrentOffer(updated);
    } catch (error) {
      console.log("Error actualizando oferta:", error);
    }
  };

  const handleAccept = async () => {
    try {
      const updatedOffer = await acceptOperation(currentOffer.id);
      setCurrentOffer(updatedOffer);
      Alert.alert("Éxito", "La oferta ha sido aceptada. Pendiente de pago.");
    } catch (error) {
      Alert.alert("Error", "No se pudo aceptar la oferta.");
    }
  };

  const handleReject = async () => {
    try {
      const updatedOffer = await rejectOperation(currentOffer.id);
      setCurrentOffer(updatedOffer);
      Alert.alert("Operación rechazada", "Has rechazado la oferta.");
    } catch (error) {
      Alert.alert("Error", "No se pudo rechazar la oferta.");
    }
  };

  const handleComprar = async () => {
    try {
      const { clientSecret } = await createOperationPaymentIntent(currentOffer.id);

      const { error } = await stripeConfirmPayment(clientSecret, {
        paymentMethodType: "Card",
        paymentMethodData: {
          billingDetails: {
            name: user?.nombre || "Usuario",
            email: user?.email || "",
          },
        },
      });

      if (error) {
        Alert.alert("Error", error.message || "No se pudo procesar el pago");
        return;
      }

      await confirmOperationPayment(currentOffer.id);
      await refreshOffer();

      Alert.alert("Éxito", "Pago realizado correctamente");
      setPaymentModalVisible(false);
    } catch (err) {
      Alert.alert("Error", "No se pudo procesar el pago");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.title}>Detalles de la oferta</Text>


        <View style={styles.card}>
          <Text style={styles.label}>Producto principal:</Text>
          <Text style={styles.value}>{currentOffer.mainProduct?.nombre}</Text>

          <Text style={styles.label}>Estado:</Text>
          <Text style={styles.value}>{currentOffer.status}</Text>

          {currentOffer.moneyOffered && (
            <>
              <Text style={styles.label}>Dinero ofrecido:</Text>
              <Text style={styles.value}>{currentOffer.moneyOffered}€</Text>
            </>
          )}

          {currentOffer.offeredProducts?.length > 0 && (
            <>
              <Text style={styles.label}>Productos ofrecidos:</Text>
              <Text style={styles.value}>
                {currentOffer.offeredProducts
                  .map((p: any) => p.product.nombre)
                  .join(", ")}
              </Text>
            </>
          )}

          <Text style={styles.label}>Solicitante:</Text>
          <Text style={styles.value}>{currentOffer.requester?.nombre}</Text>

          <Text style={styles.label}>Receptor:</Text>
          <Text style={styles.value}>{currentOffer.receiver?.nombre}</Text>
        </View>

  
        {isSeller && currentOffer.status === "PENDING" && (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={[styles.button, styles.accept]} onPress={handleAccept}>
              <Text style={styles.buttonText}>Aceptar oferta</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.reject]} onPress={handleReject}>
              <Text style={styles.buttonText}>Rechazar oferta</Text>
            </TouchableOpacity>
          </View>
        )}

        {isBuyer && currentOffer.status === "PAYMENT_PENDING" && (
          <TouchableOpacity
            style={[styles.button, styles.pay]}
            onPress={() => setPaymentModalVisible(true)}
          >
            <Text style={styles.buttonText}>Pagar con tarjeta</Text>
          </TouchableOpacity>
        )}
      </ScrollView>


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
              onFormComplete={(cardDetails) => console.log(cardDetails)}
              style={{ width: "100%", height: RFPercentage(40) }}
              cardStyle={{
                backgroundColor: colors.fondoSecundario,
                textColor: "#000",
                placeholderColor: "#000",
              }}
            />

            <TouchableOpacity
              style={[styles.button, styles.pay]}
              onPress={handleComprar}
            >
              <Text style={styles.buttonText}>Pagar ahora</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancel]}
              onPress={() => setPaymentModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DetailsOffer;



const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.fondo,
  },

  container: {
    padding: RFPercentage(3),
  },

  title: {
    fontSize: fonts.title,
    fontWeight: "bold",
    color: colors.letraTitulos,
    textAlign: "center",
    marginBottom: RFPercentage(3),
  },

  card: {
    backgroundColor: colors.fondoSecundario,
    borderRadius: RFValue(14),
    padding: RFPercentage(2.5),
    marginBottom: RFPercentage(3),
    elevation: 3,
  },

  label: {
    fontSize: fonts.medium,
    color: colors.letraSecundaria,
    marginTop: RFPercentage(1.5),
  },

  value: {
    fontSize: fonts.normal,
    color: colors.letraTitulos,
    fontWeight: "600",
  },

  buttonsContainer: {
    marginTop: RFPercentage(2),
  },

  button: {
    padding: RFPercentage(1.8),
    borderRadius: RFValue(10),
    marginVertical: RFPercentage(1),
    alignItems: "center",
  },

  accept: {
    backgroundColor: colors.exito,
  },

  reject: {
    backgroundColor: colors.error,
  },

  pay: {
    backgroundColor: colors.letraTitulos,
  },

  cancel: {
    backgroundColor: colors.letraSecundaria,
  },

  buttonText: {
    fontSize: fonts.medium,
    color: "#FFF",
    fontWeight: "bold",
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: "85%",
    backgroundColor: colors.fondoSecundario,
    borderRadius: RFValue(16),
    padding: RFPercentage(3),
  },

  modalTitle: {
    fontSize: fonts.large,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: RFPercentage(2),
    color: colors.letraTitulos,
  },
});
