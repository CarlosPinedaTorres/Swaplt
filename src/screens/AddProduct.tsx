import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";


import { SafeAreaView } from "react-native-safe-area-context";

import { useProductStore } from "../store/useProductStore";
import { createProduct, getProductOptions } from "../services/product/productService";
import { colors } from "../Styles/Colors";
import Title from "../components/Title";
import CustomInput from "../components/CustomImput";
import CustomButton from "../components/CustomButton";
import CustomPicker from "../components/CustomPicker";

const { width, height } = Dimensions.get("window");

interface AddProductProps {
  route: any;
  navigation: any;
}

const AddProduct: React.FC<AddProductProps> = ({ route, navigation }) => {
  const { userId } = route.params;

  const categorias = useProductStore((state) => state.categorias);
  const tipos = useProductStore((state) => state.tipos);
  const estados = useProductStore((state) => state.estados);

  const setCategorias = useProductStore((state) => state.setCategorias);
  const setTipos = useProductStore((state) => state.setTipos);
  const setEstados = useProductStore((state) => state.setEstados);


  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    categoriaId: null as number | null,
    tipoId: null as number | null,
    estadoId: null as number | null,
  });

  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadOptions = async () => {
      try {
        if (categorias.length && tipos.length && estados.length) {
          setLoading(false);
          return;
        }

        const { categorias: cats, tipos: tps, estados: ests } = await getProductOptions();
        setCategorias(cats);
        setTipos(tps);
        setEstados(ests);
      } catch (error) {
        console.log("Error cargando opciones:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, []);

  const handleChange = (field: keyof typeof formData, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const tipoSeleccionado = tipos.find((t) => t.id === formData.tipoId);
  const mostrarPrecio = tipoSeleccionado?.nombre === "Venta" || tipoSeleccionado?.nombre === "Ambos";

  const handleSubmit = async () => {
    const { nombre, descripcion, precio, categoriaId, tipoId, estadoId } = formData;

    if (!nombre || !descripcion || !categoriaId || !tipoId || !estadoId) {
      Alert.alert("Error", "Completa todos los campos obligatorios");
      return;
    }

    if (mostrarPrecio && !precio) {
      Alert.alert("Error", "Debes ingresar un precio para este tipo de producto");
      return;
    }

    try {
      await createProduct({
        nombre,
        descripcion,
        precio: mostrarPrecio ? parseFloat(precio) : 0,
        categoriaId,
        tipoId,
        estadoId,
        userId,
        ubicacion: "",
      });
      Alert.alert("Éxito", "Producto creado correctamente");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "No se pudo crear el producto");
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.cargando} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.fondo }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: width * 0.04,
            alignItems: "center",
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Title text="Añadir Producto" />

          <CustomInput
            placeholder="Escribe el nombre del producto"
            value={formData.nombre}
            onChangeText={(text) => handleChange("nombre", text)}
          />

          <CustomInput
            placeholder="Escribe una descripción para tu producto"
            value={formData.descripcion}
            onChangeText={(text) => handleChange("descripcion", text)}
          />


          <CustomPicker
            selectedValue={formData.tipoId}
            onValueChange={(value) => handleChange("tipoId", value)}
            items={[
              { label: "Selecciona tipo", value: null },
              ...tipos.map((t) => ({ label: t.nombre, value: t.id })),
            ]}
          />

          {mostrarPrecio && (
            <CustomInput
              placeholder="Escribe el precio del producto"
              value={formData.precio}
              onChangeText={(text) => handleChange("precio", text)}
              keyboardType="numeric"
            />
          )}

 
          <CustomPicker
            selectedValue={formData.categoriaId}
            onValueChange={(value) => handleChange("categoriaId", value)}
            items={[
              { label: "Selecciona categoría", value: null },
              ...categorias.map((c) => ({ label: c.nombre, value: c.id })),
            ]}
          />

   
          <CustomPicker
            selectedValue={formData.estadoId}
            onValueChange={(value) => handleChange("estadoId", value)}
            items={[
              { label: "Selecciona estado", value: null },
              ...estados.map((e) => ({ label: e.nombre, value: e.id })),
            ]}
          />

          <View style={{ marginVertical: height * 0.03 }}>
            <CustomButton title="Crear Producto" onPress={handleSubmit} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddProduct;
