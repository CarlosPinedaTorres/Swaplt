import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { getAllProducts } from "../services/product/productService";
import { useProductStore } from "../store/useProductStore";
import { colors } from "../Styles/Colors";
import { useNavigation } from "@react-navigation/native";

import { Menu, MenuOptions, MenuOption, MenuTrigger } from "react-native-popup-menu";
import Ionicons from "react-native-vector-icons/Ionicons";



const { width } = Dimensions.get("window");

const scaleFont = (size: number) => (width / 375) * size;

export default function Inicio() {

  const navigation = useNavigation<any>();

  const { productosGlobales, setProductosGlobales } = useProductStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const data = await getAllProducts();
        setProductosGlobales(data);
      } catch (err) {
        console.log("Error al obtener productos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.cargando} />
      </View>
    );
  }



  return (
 <View style={styles.container}>
      <Text style={styles.title}>Productos disponibles</Text>

      <FlatList
        data={productosGlobales}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
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

            {/* 🔽 Menú de los 3 puntos */}
            <View style={styles.menuContainer}>
              <Menu>
                <MenuTrigger>
                  <Ionicons name="ellipsis-vertical" size={20} color={colors.infoLetra} />
                </MenuTrigger>
                <MenuOptions>
                  <MenuOption
                    onSelect={() =>
                      navigation.navigate("EditarProducto", { producto: item })
                    }
                  >
                    <Text style={{ padding: 8 }}>✏️ Editar</Text>
                  </MenuOption>
                  <MenuOption onSelect={()=>console.log("hola")}>
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
  );
}

const styles = StyleSheet.create({
   container: {
    flex: 1,
    backgroundColor: colors.fondo,
    paddingHorizontal: width * 0.04,
    paddingTop: width * 0.05,
  },
  title: {
    fontSize: scaleFont(18),
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.letraSecundaria,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: colors.fondoSecundario,
    flex: 1,
    margin: width * 0.02,
    borderRadius: 12,
    padding: width * 0.03,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    position: "relative",
  },
  image: {
    width: "100%",
    height: width * 0.35,
    borderRadius: 10,
    resizeMode: "cover",
    marginBottom: 8,
  },
  nombre: {
    fontSize: scaleFont(14),
    fontWeight: "600",
    color: colors.letraSecundaria,
  },
  precio: {
    fontSize: scaleFont(13),
    color: colors.infoLetra,
    marginTop: 3,
  },
  detalle: {
    fontSize: scaleFont(12),
    color: colors.infoLetra,
    marginTop: 2,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: colors.infoLetra,
  },
  menuContainer: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});
