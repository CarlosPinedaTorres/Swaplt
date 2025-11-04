import React, { useCallback, useState, useMemo } from "react";
import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator, Dimensions, TouchableOpacity, KeyboardAvoidingView, Platform, } from "react-native";
import { getAllProducts } from "../services/product/productService";
import { useProductStore } from "../store/useProductStore";
import { colors } from "../Styles/Colors";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Menu, MenuOptions, MenuOption, MenuTrigger } from "react-native-popup-menu";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { RFValue, RFPercentage } from "react-native-responsive-fontsize";
import RNPickerSelect from "react-native-picker-select";
import { fonts } from "../Styles/Fonts";

const { width } = Dimensions.get("window");
const cardWidth = (width - RFPercentage(6)) / 2;

export default function Inicio() {
  const navigation = useNavigation<any>();
  const { productosGlobales, setProductosGlobales } = useProductStore();
  const [loading, setLoading] = useState(true);


  const [categoria, setCategoria] = useState<string | null>(null);
  const [estado, setEstado] = useState<string | null>(null);
  const [orden, setOrden] = useState<string>("");

  useFocusEffect(
    useCallback(() => {
      const fetchAllProducts = async () => {
        try {
          setLoading(true);
          const data = await getAllProducts();
          setProductosGlobales(data);
        } catch (err) {
          console.log("Error al obtener productos:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchAllProducts();
    }, [])
  );


  const productosFiltrados = useMemo(() => {
    let filtrados = [...productosGlobales];

    if (categoria) {
      filtrados = filtrados.filter(
        (p) => p.categoria?.nombre?.toLowerCase() === categoria.toLowerCase()
      );
    }

    if (estado) {
      filtrados = filtrados.filter(
        (p) => p.estado?.nombre?.toLowerCase() === estado.toLowerCase()
      );
    }

    // if (orden === "asc") {
    //   filtrados.sort((a, b) => a.precio - b.precio);
    // } else if (orden === "desc") {
    //   filtrados.sort((a, b) => b.precio - a.precio);
    // }

    return filtrados;
  }, [productosGlobales, categoria, estado, orden]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.cargando} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Productos disponibles</Text>


          <View style={styles.filterContainer}>
            <RNPickerSelect
              onValueChange={(value) => setCategoria(value)}
              placeholder={{ label: "Categoría", value: null }}
              items={[
                { label: "Electrónica", value: "electrónica" },
                { label: "Hogar", value: "hogar" },
                { label: "Ropa", value: "ropa" },
              ]}
              style={pickerSelectStyles}
            />

            <RNPickerSelect
              onValueChange={(value) => setEstado(value)}
              placeholder={{ label: "Estado", value: null }}
              items={[
                { label: "Nuevo", value: "nuevo" },
                { label: "Usado", value: "usado" },
              ]}
              style={pickerSelectStyles}
            />

            <RNPickerSelect
              onValueChange={(value) => setOrden(value)}
              placeholder={{ label: "Ordenar por precio", value: null }}
              items={[
                { label: "Menor a mayor", value: "asc" },
                { label: "Mayor a menor", value: "desc" },
              ]}
              style={pickerSelectStyles}
            />
          </View>


          <FlatList
            data={productosFiltrados}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={{
              justifyContent: "space-between",
            }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <TouchableOpacity
                  style={{ width: "100%" }}
                  onPress={() =>
                    navigation.navigate("DetalleProducto", { producto: item })
                  }
                >
                  <Image
                    source={require("../assets/images/defaultProfile.png")}
                    style={styles.image}
                  />
                  <Text style={styles.nombre}>{item.nombre}</Text>
                  <Text style={styles.precio}>
                    {item.precio ? `${item.precio} €` : "Sin precio"}
                  </Text>
                  <Text style={styles.detalle}>
                    {item.categoria.nombre} · {item.estado.nombre}
                  </Text>
                </TouchableOpacity>

                <View style={styles.menuContainer}>
                  <Menu>
                    <MenuTrigger>
                      <Ionicons
                        name="ellipsis-vertical"
                        size={20}
                        color={colors.infoLetra}
                      />
                    </MenuTrigger>
                    <MenuOptions>
                      <MenuOption
                        onSelect={() =>
                          navigation.navigate("EditarProducto", { producto: item })
                        }
                      >
                        <Text style={{ padding: 8 }}>✏️ Editar</Text>
                      </MenuOption>
                      <MenuOption onSelect={() => console.log("hola")}>
                        <Text style={{ padding: 8, color: "red" }}>🗑️ Eliminar</Text>
                      </MenuOption>
                    </MenuOptions>
                  </Menu>
                </View>
              </View>
            )}
            ListEmptyComponent={() => (
              <Text style={styles.emptyText}>No hay productos disponibles</Text>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.fondo,
  },
  container: {
    flex: 1,
    backgroundColor: colors.fondo,
    paddingHorizontal: RFPercentage(2),
    paddingTop: RFPercentage(2.5),
  },
  title: {
    fontSize: fonts.large,
    fontWeight: "bold",
    marginBottom: RFPercentage(1),
    color: colors.letraSecundaria,
  },
  filterContainer: {
    flexDirection: "column",
    gap: RFPercentage(1),
    marginBottom: RFPercentage(2),
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: colors.fondoSecundario,
    width: cardWidth,
    borderRadius: RFValue(10),
    padding: RFPercentage(1.5),
    marginBottom: RFPercentage(2),
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    position: "relative",
  },
  image: {
    width: "100%",
    height: RFPercentage(20),
    borderRadius: RFValue(10),
    resizeMode: "cover",
    marginBottom: RFPercentage(1),
  },
  nombre: {
    fontSize: fonts.medium,
    fontWeight: "600",
    color: colors.letraSecundaria,
  },
  precio: {
    fontSize: fonts.small,
    color: colors.infoLetra,
    marginTop: RFPercentage(0.5),
  },
  detalle: {
    fontSize: fonts.small,
    color: colors.infoLetra,
    marginTop: RFPercentage(0.5),
  },
  emptyText: {
    textAlign: "center",
    marginTop: RFPercentage(3),
    color: colors.infoLetra,
    fontSize: fonts.small,
  },
  menuContainer: {
    position: "absolute",
    top: RFPercentage(1),
    right: RFPercentage(1),
  },
});

const pickerSelectStyles = {
  inputIOS: {
    backgroundColor: colors.fondoSecundario,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    color: colors.letraSecundaria,
    fontSize: RFValue(14),
  },
  inputAndroid: {
    backgroundColor: colors.fondoSecundario,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    color: colors.letraSecundaria,
    fontSize: RFValue(14),
  },
};
