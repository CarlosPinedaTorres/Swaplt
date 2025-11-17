import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Button, Alert } from "react-native";
import { RouteProp, useRoute, useNavigation, NavigationProp } from "@react-navigation/native";
import { colors } from "../Styles/Colors";
import { useAuthStore } from "../store/useAuthStore";
import { ProductDetailsData } from "../types/Product";
import { getMyProducts } from "../services/product/productService";

type RootStackParamList = {
  DetailsOffer: { producto: ProductDetailsData };
};

type DetailsOfferRouteProp = RouteProp<RootStackParamList, "DetailsOffer">;

const DetailsOffer = () => {
  const route = useRoute<DetailsOfferRouteProp>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { producto } = route.params;
  const userId = Number(useAuthStore((state) => state.user?.id));

  const [myProducts, setMyProducts] = useState<ProductDetailsData[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getMyProducts();
        setMyProducts(res);
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "No se pudieron cargar tus productos");
      }
    };
    fetchProducts();
  }, [userId]);

  const handleOffer = async () => {
    if (!selectedProduct) {
      Alert.alert("Selecciona un producto para ofertar");
      return;
    }
    try {
     
      Alert.alert("Éxito", "Oferta enviada correctamente");
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo enviar la oferta");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/defaultProfile.png")}
        style={styles.image}
      />
      <Text style={styles.nombre}>{producto.nombre}</Text>

      <View style={styles.listContainer}>
        <Text style={styles.tituloLista}>Selecciona uno de tus productos:</Text>

        <FlatList
          data={myProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.item,
                selectedProduct === item.id && styles.itemSeleccionado,
              ]}
              onPress={() => setSelectedProduct(item.id)}
            >
              <Image
                source={require("../assets/images/defaultProfile.png")}
                style={styles.itemImage}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemNombre}>{item.nombre}</Text>
                <Text style={styles.itemPrecio}>
                  {item.precio ? `${item.precio} €` : "Sin precio"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      <Button title="Hacer oferta" onPress={handleOffer} disabled={!selectedProduct} />
    </View>
  );
};

export default DetailsOffer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fondo,
    padding: 16,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  nombre: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.letraSecundaria,
    marginBottom: 20,
    textAlign: "center",
  },
  listContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor:  "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  tituloLista: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.letraSecundaria,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  itemSeleccionado: {
    borderColor:  "#007AFF",
    backgroundColor: "#e0f0ff",
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  itemNombre: {
    fontSize: 16,
    color: colors.letraSecundaria,
  },
  itemPrecio: {
    fontSize: 14,
    color: colors.infoLetra,
  },
});
