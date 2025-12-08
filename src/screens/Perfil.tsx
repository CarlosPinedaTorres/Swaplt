import { FlatList, View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions, Modal } from "react-native";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import Toast from "react-native-toast-message";

import { RFValue, RFPercentage } from "react-native-responsive-fontsize";
import { colors } from "../Styles/Colors";
import { fonts } from "../Styles/Fonts";

import { useAuthStore } from "../store/useAuthStore";
import { useProductStore } from "../store/useProductStore";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getUserProfile, logoutUser } from "../services/user/userService";
import { getWallet } from "../services/wallet/walletService";
import { getMyProducts, getProductOptions, deleteProduct } from "../services/product/productService";

import ProductCard from "../components/ProductCard";
import ProductFilter from "../components/ProductFilter";


import { useOptionsStore } from "../store/useOptionStorage";



const { width, height } = Dimensions.get("window");

const Perfil = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const { productosUsuario, setProductosUsuario } = useProductStore();
  const { user, refreshToken, logout, perfil, setPerfil,hydrated } = useAuthStore();

  const [wallet, setWallet] = useState<{ balance: number; pendingBalance: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const { categorias, tipos, estados, opcionesCargadas, setOpciones } = useOptionsStore();

  const [categoriaFiltro, setCategoria] = useState<string | null>(null);
  const [estadoFiltro, setEstado] = useState<string | null>(null);
  const [tipoFiltro, setTipo] = useState<string | null>(null);



  const [orden, setOrden] = useState<string>("");


  const navigation = useNavigation<any>();
  const loadMyProducts = async () => {
    try {
      const data = await getMyProducts();
      setProductosUsuario(data);
    } catch (err) {
      console.log("Error recargando productos:", err);
    }
  };



useEffect(() => {
  if (!hydrated) return; 
  if (!perfil && user) {
    const fetchPerfil = async () => {
      try {
        const data = await getUserProfile(user.id);
        setPerfil(data);
      } catch (err) {
        console.log("Error cargando perfil:", err);
        setPerfil(null);
      }
    };
    fetchPerfil();
  }
}, [hydrated, perfil, user]);


  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        if (!user) return setLoading(false);

        setLoading(true);
        try {
          const [misProductos, walletData] = await Promise.all([
            getMyProducts(),
            getWallet(),
          ]);

          setWallet(walletData);
          setProductosUsuario(misProductos);
          if (!opcionesCargadas) {
            const opciones = await getProductOptions();
            setOpciones(opciones);
          }
        
        } catch (err) {
          console.log("Error cargando perfil o productos:", err);
          setPerfil(null);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }, [user])
  );

  const openDeleteModal = (id: number) => {
    setProductToDelete(id);
    setModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct(productToDelete);
      Toast.show({
        type: "success",
        text1: "Producto eliminado",
        text2: "Se eliminó correctamente el producto.",
      });
      await loadMyProducts();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo eliminar el producto",
      });
    } finally {
      setModalVisible(false);
      setProductToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setModalVisible(false);
    setProductToDelete(null);
  };



  const handleLogout = async () => {
    try {
      if (!refreshToken) {
        logout();
        return;
      }

      await logoutUser(refreshToken);
      logout();
      Toast.show({
        type: "success",
        text1: "Sesión cerrada",
        text2: "Has cerrado sesión correctamente.",
      });
    } catch (error: any) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Error al cerrar sesión",
        text2: error.response?.data?.error || "No se pudo cerrar sesión",
      });
    }
  };

const productosFiltradosUsuario = useMemo(() => {
  let filtrados = productosUsuario.filter(p => p.visibilidad !== false);

  if (categoriaFiltro)
    filtrados = filtrados.filter(
      (p) => p.categoria?.nombre?.toLowerCase() === categoriaFiltro.toLowerCase()
    );

  if (estadoFiltro)
    filtrados = filtrados.filter(
      (p) => p.estado?.nombre?.toLowerCase() === estadoFiltro.toLowerCase()
    );

  if (tipoFiltro)
    filtrados = filtrados.filter(
      (p) => p.tipo?.nombre?.toLowerCase() === tipoFiltro.toLowerCase()
    );

  if (orden === "asc")
    filtrados.sort((a, b) => (a.precio ?? 0) - (b.precio ?? 0));

  else if (orden === "desc")
    filtrados.sort((a, b) => (b.precio ?? 0) - (a.precio ?? 0));

  return filtrados;
}, [productosUsuario, categoriaFiltro, estadoFiltro, tipoFiltro, orden]);


  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.fondo }}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.cargando} />

        </View>
      </SafeAreaView>
    );
  }

  if (!perfil) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.fondo }}>
        <View style={styles.center}>
          <Text>No se encontró información del perfil.</Text>

        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.fondo }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.container}>

            <View style={styles.profileCard}>
              <View style={styles.profileTop}>
                <Image
                  source={
                    perfil.fotoPerfil
                      ? { uri: perfil.fotoPerfil }
                      : require("../assets/images/defaultProfile.png")
                  }
                  style={styles.avatarLarge}
                />
                <View style={styles.profileText}>
                  <Text style={styles.profileName}>
                    {perfil.nombre} {perfil.apellidos}
                  </Text>
                  <Text style={styles.profileCity}>
                    <Ionicons name="location-outline" size={16} color={colors.letraSecundaria} />{" "}
                    {perfil.ciudad}
                  </Text>
                  <Text style={styles.profileEmail}>
                    <Ionicons name="mail-outline" size={16} color={colors.letraSecundaria} />{" "}
                    {perfil.email}
                  </Text>
                </View>
              </View>

              {wallet && (
                <View style={styles.walletContainer}>
                  <Ionicons name="wallet-outline" size={18} color={colors.letraSecundaria} />
                  <Text style={styles.walletText}>
                    Saldo disponible: {wallet.balance.toFixed(2)} €
                  </Text>
                </View>
              )}

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.fondo }]}
                  onPress={() => navigation.navigate("EditarPerfil")}
                >
                  <Ionicons name="create-outline" size={18} color={colors.letraSecundaria} />
                  <Text style={styles.actionText}>Editar perfil</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.error }]}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out-outline" size={18} color={colors.fondo} />
                  <Text style={[styles.actionText, { color: colors.fondo }]}>Cerrar sesión</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mis productos</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("AddProduct", { userId: perfil.id })}
              >
                <Ionicons name="add-circle-outline" size={RFValue(22)} />
              </TouchableOpacity>
            </View>

            <ProductFilter
              categorias={categorias}
              estados={estados}
              tipos={tipos}
              setCategoria={setCategoria}
              setEstado={setEstado}
              setTipo={setTipo}
              setOrden={setOrden}
            />

            <FlatList
              data={productosFiltradosUsuario}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              contentContainerStyle={{ paddingBottom: RFPercentage(4) }}
              renderItem={({ item }) => (
                <ProductCard
                  item={item}
                  onPress={() => navigation.navigate("DetalleProducto", { producto: item })}
                  onEdit={() =>
                    navigation.navigate("EditarProducto", {
                      producto: item,
                      opciones: { categorias, tipos, estados },
                    })
                  }
                  onDelete={() => openDeleteModal(item.id)}

                  isOwner={true}
                />

              )}
              ListEmptyComponent={() => (
                <Text style={{ textAlign: "center", color: colors.infoLetra, marginTop: 20 }}>
                  No tienes productos aún.
                </Text>
              )}
              scrollEnabled={false}
            />
          </View>

          <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={handleCancelDelete}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Eliminar producto</Text>
                <Text style={styles.modalMessage}>¿Estás seguro de que quieres eliminar este producto?</Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.letraSecundaria }]} onPress={handleCancelDelete}>
                    <Text style={{ color: colors.fondo, fontWeight: "600" }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.error }]} onPress={handleConfirmDelete}>
                    <Text style={{ color: colors.fondo, fontWeight: "600" }}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fondo,
    paddingHorizontal: RFPercentage(2),
    paddingTop: RFPercentage(2.5),
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: RFPercentage(1.2),
    marginTop: RFPercentage(1),
  },
  sectionTitle: {
    fontSize: fonts.medium,
    fontWeight: "600",
    color: colors.letraSecundaria,
  },
  profileCard: {
    backgroundColor: colors.fondoSecundario,
    borderRadius: RFValue(16),
    padding: RFPercentage(2),
    marginBottom: RFPercentage(2),
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  profileTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: RFValue(10),
  },
  avatarLarge: {
    width: width * 0.22,
    height: width * 0.22,
    borderRadius: (width * 0.22) / 2,
    marginRight: RFValue(10),
    borderWidth: 2,
    borderColor: colors.letraSecundaria,
  },

  profileText: { flex: 1 },
  profileName: {
    fontSize: fonts.medium,
    fontWeight: "bold",
    color: colors.letraTitulos,
  },
  profileCity: {
    fontSize: fonts.small,
    color: colors.infoLetra,
    marginTop: 2,
  },
  profileEmail: {
    fontSize: fonts.small,
    color: colors.infoLetra,
    marginTop: 2,
  },
  walletContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.fondo,
    borderRadius: RFValue(10),
    paddingVertical: RFValue(6),
    paddingHorizontal: RFValue(10),
    marginTop: RFPercentage(1),
  },
  walletText: {
    marginLeft: 8,
    fontSize: fonts.small,
    color: colors.letraTitulos,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: RFPercentage(1.5),

  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: RFValue(10),
    paddingVertical: RFValue(8),
    paddingHorizontal: RFValue(12),
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 4,
  },
  actionText: {
    marginLeft: 6,
    fontWeight: "600",
    color: colors.letraSecundaria,
    fontSize: fonts.small,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: "85%",
    backgroundColor: colors.fondo,
    borderRadius: RFValue(16),
    padding: RFPercentage(3),
  },

  modalTitle: {
    fontSize: fonts.medium,
    fontWeight: "700",
    marginBottom: RFPercentage(1.5),
    color: colors.letraTitulos,
    textAlign: "center",
  },

  modalMessage: {
    fontSize: fonts.normal,
    color: colors.letraSecundaria,
    textAlign: "center",
    marginBottom: RFPercentage(2),
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  modalButton: {
    flex: 1,
    paddingVertical: RFValue(10),
    borderRadius: RFValue(10),
    marginHorizontal: RFValue(5),
    alignItems: "center",
  },

});

export default Perfil;
