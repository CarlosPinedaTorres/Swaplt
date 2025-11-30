import React, { useCallback, useState, useMemo } from "react";
import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator, Dimensions, TouchableOpacity, KeyboardAvoidingView, Platform, } from "react-native";
import { getAllProducts, getProductOptions } from "../services/product/productService";
import { useProductStore } from "../store/useProductStore";
import { colors } from "../Styles/Colors";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import {  RFPercentage } from "react-native-responsive-fontsize";
import { fonts } from "../Styles/Fonts";
import Title from "../components/Title";
import ProductCard from "../components/ProductCard";
import ProductFilter from "../components/ProductFilter";



export default function Inicio() {
  const navigation = useNavigation<any>();
  const { productosGlobales, setProductosGlobales } = useProductStore();
  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(true);

  const [categoria, setCategoria] = useState<string | null>(null);
  const [estado, setEstado] = useState<string | null>(null);
  const [tipo, setTipo] = useState<string | null>(null);
  const [orden, setOrden] = useState<string>("");

  const [categorias, setCategorias] = useState<any[]>([]);
  const [tipos, setTipos] = useState<any[]>([]);
  const [estados, setEstados] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchAllData = async () => {
        try {
          setLoading(true);
          setOptionsLoading(true);

          const [productos, opciones] = await Promise.all([
            getAllProducts(),
            getProductOptions()
          ]);
        
          setProductosGlobales(productos);
    
          setCategorias(opciones.categorias);
          setTipos(opciones.tipos);
          setEstados(opciones.estados);
        } catch (err) {
          console.log("Error al obtener productos u opciones:", err);
        } finally {
          setLoading(false);
          setOptionsLoading(false);
        }
      };

      fetchAllData();
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
    if (tipo) {
      filtrados = filtrados.filter(
        (p) => p.tipo?.nombre?.toLowerCase() === tipo.toLowerCase()
      );
    }
    if (orden === "asc") {
      filtrados.sort((a, b) => (a.precio ?? 0) - (b.precio ?? 0));
    } else if (orden === "desc") {
      filtrados.sort((a, b) => (b.precio ?? 0) - (a.precio ?? 0));
    }

    return filtrados;
  }, [productosGlobales, categoria, estado, tipo, orden]);

  if (loading || optionsLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.cargando} />
      </View>
    );
  }
 
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Title text="Productos disponibles" />
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
          data={productosFiltrados}
          contentContainerStyle={{ paddingBottom: RFPercentage(4) }}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ item }) => (
            <ProductCard
              item={item}
              onPress={() => navigation.navigate("DetalleProducto", { producto: item })}
            />
          )}

          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>No hay productos disponibles</Text>
          )}
        />
      </View>
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

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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



