import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Button,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuthStore } from "../store/useAuthStore";
import {
  acceptOperation,
  rejectOperation,
  getOperationById,
  deleteOfferOperation,
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
import Toast from "react-native-toast-message";

const DetailsOffer = () => {
  const [isPaying, setIsPaying] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { offer } = route.params as any;
  const user = useAuthStore((state) => state.user);

  const [currentOffer, setCurrentOffer] = useState(offer);
  const isSeller = currentOffer.receiverId === user?.id;
  const isBuyer = currentOffer.requesterId === user?.id;
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const { confirmPayment: stripeConfirmPayment } = useStripe();
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const canDelete = !["COMPLETED", "PAID"].includes(currentOffer.status);
  const handleDeleteOffer = async () => {
    try {
      await deleteOfferOperation(currentOffer.id);
      Toast.show({ type: "success", text1: "Oferta eliminada correctamente" });
      navigation.goBack();
    } catch {
      Toast.show({ type: "error", text1: "Error", text2: "No se pudo eliminar la oferta" });
    }
  };

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
      Toast.show({
        type: "success",
        text1: "Oferta aceptada",
        text2: "La oferta ha sido aceptada.",
      });
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "No se pudo aceptar la oferta." });
    }
  };

  const handleReject = async () => {
    try {
      const updatedOffer = await rejectOperation(currentOffer.id);
      setCurrentOffer(updatedOffer);
      Toast.show({
        type: "info",
        text1: "Oferta rechazada",
        text2: "Has rechazado la oferta.",
      });
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "No se pudo rechazar la oferta." });
    }
  };

  const handleComprar = async () => {
    try {
      if (isPaying) return;

      setIsPaying(true);
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
        Toast.show({ type: "error", text1: "Error", text2: error.message || "No se pudo procesar el pago" });
        return;
      }

      await confirmOperationPayment(currentOffer.id);
      await refreshOffer();

      Toast.show({
        type: "success",
        text1: "Pago realizado",
        text2: "Pago realizado correctamente",
      });
      setPaymentModalVisible(false);
      setIsPaying(false);
    } catch (err) {
      Toast.show({ type: "error", text1: "Error", text2: "No se pudo procesar el pago" });
      setIsPaying(false);
    }
  };
  console.log(currentOffer)

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
        {canDelete && (
          <TouchableOpacity
            style={[styles.button, styles.reject]}
            onPress={() => setDeleteModalVisible(true)}
          >
            <Text style={styles.buttonText}>Eliminar oferta</Text>
          </TouchableOpacity>
        )}
        <Modal visible={deleteModalVisible} transparent animationType="fade">
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Eliminar oferta</Text>
              <Text style={{ textAlign: "center", marginVertical: RFPercentage(2) }}>
                ¿Estás seguro de que deseas eliminar esta oferta?
              </Text>
              <Button title="Eliminar" onPress={handleDeleteOffer} color={colors.error} />
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.letraSecundaria }]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
              defaultValues={{
                countryCode: "ES",
              }}
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

            <Button
              title={isPaying ? "Procesando..." : "Pagar ahora"}
              onPress={handleComprar}
              color={colors.letraTitulos}
              disabled={isPaying}
            />
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.letraSecundaria }]}
              onPress={() => setPaymentModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancelar</Text>
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

});
