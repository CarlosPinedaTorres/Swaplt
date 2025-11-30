import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Button, Alert } from "react-native";
import { RouteProp, useRoute, useNavigation, NavigationProp } from "@react-navigation/native";
import { colors } from "../Styles/Colors";
import { useAuthStore } from "../store/useAuthStore";
import { ProductDetailsData } from "../types/Product";
import { getMyProducts } from "../services/product/productService";
import { createOfferOperation } from "../services/Offers/offerService";
import ImageCarousel from "../components/ImageCarrousel";

type RootStackParamList = {
    TradeOffer: { producto: ProductDetailsData };
};

type TradeOfferRouteProp = RouteProp<RootStackParamList, "TradeOffer">;

const TradeOffer = () => {
    const route = useRoute<TradeOfferRouteProp>();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { producto } = route.params;
    const userId = Number(useAuthStore((state) => state.user?.id));

    const [myProducts, setMyProducts] = useState<ProductDetailsData[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);


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
        if (selectedProducts.length === 0) {
            Alert.alert("Selecciona al menos un producto para ofertar");
            return;
        }
        try {
            const response = await createOfferOperation({
                requesterId: userId,
                mainProductId: producto.id,
                offeredProductIds: selectedProducts
            });

            if (response?.operationId) {
                Alert.alert("Éxito", "Oferta enviada correctamente");
                navigation.goBack();
            } else {
                Alert.alert("Error", "No se pudo enviar la oferta");
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "No se pudo enviar la oferta");
        }
    };


    return (
        <View style={styles.container}>
            <ImageCarousel
                images={
                    producto.fotos?.length
                        ? producto.fotos.map(f => f.url)
                        : ["https://cdn-icons-png.flaticon.com/512/67/67353.png"]
                }
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
                                selectedProducts.includes(item.id) && styles.itemSeleccionado
                            ]}
                            onPress={() => {
                                if (selectedProducts.includes(item.id)) {

                                    setSelectedProducts(selectedProducts.filter(id => id !== item.id));
                                } else {

                                    setSelectedProducts([...selectedProducts, item.id]);
                                }
                            }}
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

            <TouchableOpacity
                onPress={handleOffer}
                disabled={selectedProducts.length === 0}
                style={[
                    {
                        backgroundColor: colors.botonFondo,
                        padding: 12,
                        borderRadius: 8,
                        alignItems: "center",
                        opacity: selectedProducts.length === 0 ? 0.5 : 1,
                    }
                ]}
            >
                <Text style={{ color: "#000", fontWeight: "bold" }}>
                    Hacer oferta
                </Text>
            </TouchableOpacity>

        </View>
    );
};

export default TradeOffer;

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
        borderColor: "#ccc",
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
        borderColor: "#007AFF",
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
