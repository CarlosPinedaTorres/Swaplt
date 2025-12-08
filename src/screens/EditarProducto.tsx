import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,

    Image,
} from "react-native";

import { launchImageLibrary } from "react-native-image-picker";
import { Picker } from "@react-native-picker/picker";
import Ionicons from "react-native-vector-icons/Ionicons";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { colors } from "../Styles/Colors";
import { fonts } from "../Styles/Fonts";
import { updateProduct } from "../services/product/productService";
import api from "../services/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProductImage } from "../types/Product";
import Toast from "react-native-toast-message";

const EditarProducto = ({ navigation, route }: any) => {
    const producto = route.params?.producto;
    const opciones = route.params?.opciones;

    const [nombre, setNombre] = useState(producto?.nombre || "");
    const [descripcion, setDescripcion] = useState(producto?.descripcion || "");
    const [precio, setPrecio] = useState(producto?.precio?.toString() || "");
    const [loading, setLoading] = useState(false);


    const [categorias] = useState(opciones?.categorias || []);
    const [tipos] = useState(opciones?.tipos || []);
    const [estados] = useState(opciones?.estados || []);
    const [ubicacion, setUbicacion] = useState(producto?.ubicacion || "");
    const [disponibilidad, setDisponibilidad] = useState(producto?.disponibilidad ?? true);

    const [categoriaId, setCategoriaId] = useState(
        categorias.find((c: any) => c.nombre === producto?.categoria?.nombre)?.id
    );
    const [tipoId, setTipoId] = useState(
        tipos.find((t: any) => t.nombre === producto?.tipo?.nombre)?.id
    );
    const [estadoId, setEstadoId] = useState(
        estados.find((e: any) => e.nombre === producto?.estado?.nombre)?.id
    );
    const [images, setImages] = useState<ProductImage[]>(
        producto?.fotos?.map((f: any) => ({ id: f.id, url: f.url })) || []
    );
    console.log(images)
    const handleUploadImage = async (index: number) => {
        const result = await launchImageLibrary({ mediaType: "photo" });
        if (!result.assets || result.assets.length === 0) return;

        const photo = result.assets[0];
        const formData = new FormData();
        formData.append("image", {
            uri: photo.uri,
            type: photo.type,
            name: photo.fileName || `photo-${Date.now()}.jpg`,
        } as any);

        try {
            const response = await api.post("/cloud/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const newImages = [...images];
            const existingImage = newImages[index];

            newImages[index] = existingImage?.id
                ? { id: existingImage.id, url: response.data.url }
                : { url: response.data.url };

            setImages(newImages);
            Toast.show({
                type: "success",
                text1: "Imagen actualizada",
                text2: "La imagen se ha actualizado correctamente",
            });
        } catch (error) {
            console.log("Error al subir imagen:", error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "No se pudo subir la imagen",
            });
        }
    };

    const handleAddImage = async () => {
        const result = await launchImageLibrary({ mediaType: "photo" });
        if (!result.assets || result.assets.length === 0) return;

        const photo = result.assets[0];
        const formData = new FormData();
        formData.append("image", {
            uri: photo.uri,
            type: photo.type,
            name: photo.fileName || `photo-${Date.now()}.jpg`,
        } as any);

        try {
            const response = await api.post("/cloud/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setImages([...images, { url: response.data.url }]);
            Toast.show({
                type: "success",
                text1: "Imagen subida",
                text2: "Se agregó una nueva imagen",
            });
        } catch (error) {
            console.log("Error al subir imagen:", error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "No se pudo subir la imagen",
            });
        }
    };

    const handleUpdate = async () => {

        if (!nombre.trim()) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "El nombre del producto es obligatorio",
            });
            return;
        }
        const tipoNombre = tipos.find((t: any) => t.id === tipoId)?.nombre;
        if (["Venta", "Ambos"].includes(tipoNombre) && !precio.trim()) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Debes indicar un precio para este producto",
            });
            return;
        }
        setLoading(true);
        try {
            await updateProduct(producto.id, {
                nombre,
                descripcion,
                precio: precio ? parseFloat(precio) : undefined,
                categoriaId: Number(categoriaId),
                tipoId: Number(tipoId),
                estadoId: Number(estadoId),
                ubicacion: ubicacion || undefined,
                disponibilidad,
                fotos: images,
                userId: producto.userId,
            });


            Toast.show({
                type: "success",
                text1: "Producto actualizado",
                text2: "Producto actualizado correctamente",
            });
            navigation.goBack();
        } catch (err) {
            console.log(err);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "No se pudo actualizar el producto",
            });
        } finally {
            setLoading(false);
        }
    };
    console.log(producto)




    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.fondo }}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Editar producto</Text>


                <View style={styles.imagesContainer}>
                    {images.map((img, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleUploadImage(index)}
                        >
                            <Image
                                source={{ uri: img.url }}
                                style={styles.image}
                            />
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity onPress={handleAddImage} style={styles.addImageBtn}>
                        <Ionicons name="add" size={RFValue(24)} color={colors.fondo} />
                    </TouchableOpacity>
                </View>


                <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Nombre" placeholderTextColor={colors.infoLetra} />
                <TextInput
                    style={[styles.input, { height: RFPercentage(12), textAlignVertical: "top" }]}
                    multiline
                    value={descripcion}
                    onChangeText={setDescripcion}
                    placeholder="Descripción"
                    placeholderTextColor={colors.infoLetra}
                />
                {["Venta", "Ambos"].includes(
                    tipos.find((t: any) => t.id === tipoId)?.nombre
                ) && (
                        <TextInput
                            style={styles.input}
                            value={precio}
                            onChangeText={setPrecio}
                            keyboardType="numeric"
                            placeholder="Precio (€)"
                            placeholderTextColor={colors.infoLetra}
                        />
                    )}


                <Picker selectedValue={categoriaId} onValueChange={setCategoriaId} style={styles.picker}>
                    {categorias.map((cat: any) => <Picker.Item key={cat.id} label={cat.nombre} value={cat.id} />)}
                </Picker>

                <Picker selectedValue={tipoId} onValueChange={setTipoId} style={styles.picker}>
                    {tipos.map((tipo: any) => <Picker.Item key={tipo.id} label={tipo.nombre} value={tipo.id} />)}
                </Picker>

                <Picker selectedValue={estadoId} onValueChange={setEstadoId} style={styles.picker}>
                    {estados.map((estado: any) => <Picker.Item key={estado.id} label={estado.nombre} value={estado.id} />)}
                </Picker>


                <TextInput style={styles.input} value={ubicacion} onChangeText={setUbicacion} placeholder="Ubicación" placeholderTextColor={colors.infoLetra} />

                <TouchableOpacity style={[styles.button, loading && { opacity: 0.7 }]} onPress={handleUpdate} disabled={loading}>
                    {loading ? <ActivityIndicator color={colors.fondo} /> :
                        <>
                            <Ionicons name="save-outline" size={18} color={colors.fondo} />
                            <Text style={styles.buttonText}>Guardar cambios</Text>
                        </>
                    }
                </TouchableOpacity>
            </ScrollView>
            <Toast />
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: colors.fondo, padding: RFPercentage(2.5) },
    title: { fontSize: fonts.title, color: colors.letraTitulos, marginBottom: RFPercentage(2) },
    input: { borderWidth: 1, borderColor: colors.fondo, borderRadius: RFValue(8), paddingHorizontal: RFValue(10), paddingVertical: RFValue(8), color: colors.letraSecundaria, backgroundColor: colors.fondoSecundario, marginBottom: RFPercentage(2) },
    picker: { backgroundColor: colors.fondoSecundario, borderRadius: RFValue(8), color: colors.letraSecundaria, marginBottom: RFPercentage(2) },
    button: { backgroundColor: colors.botonFondo, paddingVertical: RFValue(12), borderRadius: RFValue(10), flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: RFPercentage(2) },
    buttonText: { color: colors.fondo, fontWeight: "bold", marginLeft: 8 },
    imagesContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: RFPercentage(2) },
    image: { width: RFPercentage(15), height: RFPercentage(15), borderRadius: RFValue(8), marginRight: RFPercentage(1), marginBottom: RFPercentage(1) },
    addImageBtn: { width: RFPercentage(15), height: RFPercentage(15), backgroundColor: colors.botonFondo, justifyContent: "center", alignItems: "center", borderRadius: RFValue(8), marginRight: RFPercentage(1), marginBottom: RFPercentage(1) },
});

export default EditarProducto;
