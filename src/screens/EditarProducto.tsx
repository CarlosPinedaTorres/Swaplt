import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    Switch,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { colors } from "../Styles/Colors";
import { fonts } from "../Styles/Fonts";
import { updateProduct } from "../services/product/productService";

type EditarProductoRoute = RouteProp<{ params: { producto: any, opciones: any } }, "params">;

const EditarProducto = () => {
    const route = useRoute<EditarProductoRoute>();
    const navigation = useNavigation<any>();

    const producto = route.params?.producto;

    console.log(producto)
    const opciones = route.params?.opciones;
    const [nombre, setNombre] = useState(producto?.nombre || "");
    const [descripcion, setDescripcion] = useState(producto?.descripcion || "");
    const [precio, setPrecio] = useState(producto?.precio?.toString() || "");
    const [loading, setLoading] = useState(false);
    const [categoriaId, setCategoriaId] = useState(producto?.categoriaId || undefined);
    const [tipoId, setTipoId] = useState(producto?.tipoId || undefined);
    const [estadoId, setEstadoId] = useState(producto?.estadoId || undefined);
    const [categorias, setCategorias] = useState(opciones?.categorias || []);
    const [tipos, setTipos] = useState(opciones?.tipos || []);
    const [estados, setEstados] = useState(opciones?.estados || []);
    console.log(estados,tipos,categorias)
    const [ubicacion, setUbicacion] = useState(producto?.ubicacion || "");
    const [disponibilidad, setDisponibilidad] = useState(
        producto?.disponibilidad ?? true
    );

    const handleUpdate = async () => {
        if (!nombre.trim()) {
            Alert.alert("Error", "El nombre del producto es obligatorio");
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
            });


            Alert.alert("Éxito", "Producto actualizado correctamente", [
                {
                    text: "OK",
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (err) {
            console.log(err);
            Alert.alert("Error", "No se pudo actualizar el producto");
        } finally {
            setLoading(false);
        }
    };

    if (!producto) {
        return (
            <View style={styles.center}>
                <Text>No se encontró el producto.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Editar producto</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                    style={styles.input}
                    value={nombre}
                    onChangeText={setNombre}
                    placeholder="Nombre del producto"
                    placeholderTextColor={colors.infoLetra}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Descripción</Text>
                <TextInput
                    style={[styles.input, { height: RFPercentage(12), textAlignVertical: "top" }]}
                    multiline
                    value={descripcion}
                    onChangeText={setDescripcion}
                    placeholder="Descripción del producto"
                    placeholderTextColor={colors.infoLetra}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Precio (€)</Text>
                <TextInput
                    style={styles.input}
                    value={precio}
                    onChangeText={setPrecio}
                    keyboardType="numeric"
                    placeholder="Ej: 25.99"
                    placeholderTextColor={colors.infoLetra}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Categoría</Text>
                <Picker
                    selectedValue={categoriaId}
                    onValueChange={(value) => setCategoriaId(value)}
                    style={styles.picker}
                >
                    {categorias.map((cat: any) => (
                        <Picker.Item key={cat.id} label={cat.nombre} value={cat.id} />
                    ))}
                </Picker>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo</Text>
                <Picker
                    selectedValue={tipoId}
                    onValueChange={(value) => setTipoId(value)}
                    style={styles.picker}
                >
                    {tipos.map((tipo: any) => (
                        <Picker.Item key={tipo.id} label={tipo.nombre} value={tipo.id} />
                    ))}
                </Picker>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Estado</Text>
                <Picker
                    selectedValue={estadoId}
                    onValueChange={(value) => setEstadoId(value)}
                    style={styles.picker}
                >
                    {estados.map((estado: any) => (
                        <Picker.Item key={estado.id} label={estado.nombre} value={estado.id} />
                    ))}
                </Picker>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Ubicación</Text>
                <TextInput
                    style={styles.input}
                    value={ubicacion}
                    onChangeText={setUbicacion}
                    placeholder="Ubicación del producto"
                    placeholderTextColor={colors.infoLetra}
                />
            </View>


            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                <Text style={{ color: colors.letraSecundaria, marginRight: 10 }}>Disponible</Text>
                <Switch
                    value={disponibilidad}
                    onValueChange={setDisponibilidad}
                    thumbColor={disponibilidad ? colors.botonFondo : colors.infoLetra}
                />
            </View>

            <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                onPress={handleUpdate}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={colors.fondo} />
                ) : (
                    <>
                        <Ionicons name="save-outline" size={18} color={colors.fondo} />
                        <Text style={styles.buttonText}>Guardar cambios</Text>
                    </>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    picker: {
        backgroundColor: colors.fondoSecundario,
        borderRadius: RFValue(8),
        color: colors.letraSecundaria,
    }
    ,
    container: {
        flexGrow: 1,
        backgroundColor: colors.fondo,
        padding: RFPercentage(2.5),
    },
    title: {
        fontSize: fonts.medium,
        fontWeight: "700",
        color: colors.letraTitulos,
        marginBottom: RFPercentage(2),
    },
    inputGroup: {
        marginBottom: RFPercentage(2),
    },
    label: {
        fontSize: fonts.small,
        color: colors.letraSecundaria,
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.fondo,
        borderRadius: RFValue(8),
        paddingHorizontal: RFValue(10),
        paddingVertical: RFValue(8),
        color: colors.letraSecundaria,
        backgroundColor: colors.fondoSecundario,
    },
    button: {
        backgroundColor: colors.botonFondo,
        paddingVertical: RFValue(12),
        borderRadius: RFValue(10),
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: RFPercentage(2),
    },
    buttonText: {
        color: colors.fondo,
        fontWeight: "bold",
        marginLeft: 8,
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});

export default EditarProducto;
