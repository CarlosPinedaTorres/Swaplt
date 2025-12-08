import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet,  Image, ScrollView } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { RFPercentage } from "react-native-responsive-fontsize";
import { useAuthStore } from "../store/useAuthStore";
import { colors } from "../Styles/Colors";
import { fonts } from "../Styles/Fonts";
import { editUser } from "../services/user/userService";
import api from "../services/api";
import Toast from "react-native-toast-message";

const EditarPerfil = ({ navigation }: any) => {
    const { perfil, setPerfil } = useAuthStore();
    const [nombre, setNombre] = useState(perfil?.nombre || "");
    const [apellidos, setApellidos] = useState(perfil?.apellidos || "");
    const [ciudad, setCiudad] = useState(perfil?.ciudad || "");
    const [email, setEmail] = useState(perfil?.email?.toString() || "");
    const [image, setImage] = useState<string>(perfil?.fotoPerfil || "");

    const handleSave = async () => {
        try {
            const updated = await editUser({
                nombre,
                apellidos,
                ciudad,
                email,
                fotoPerfil: image,
            });
            setPerfil(updated);
            Toast.show({
                type: "success",
                text1: "Perfil actualizado",
                text2: "Perfil actualizado correctamente",
            });
            navigation.goBack();
        } catch (error) {
            console.log(error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "No se pudo actualizar el perfil",
            });
        }
    };

    const handleUploadImage = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo' });
        if (!result.assets || result.assets.length === 0) return;

        const photo = result.assets[0];

        const formData = new FormData();
        formData.append('image', {
            uri: photo.uri,
            type: photo.type,
            name: photo.fileName || `photo-${Date.now()}.jpg`,
        } as any);

        try {
            const response = await api.post("/cloud/upload", formData, {
                headers: { 'Content-Type': "multipart/form-data" },
            });
            setImage(response.data.url);
            Toast.show({
                type: "success",
                text1: "Imagen subida",
                text2: "La imagen se ha subido correctamente",
            });
        } catch (error) {
            console.log('Error al subir imagen:', error);
            Toast.show({
                type: "success",
                text1: "Imagen subida",
                text2: "La imagen se ha subido correctamente",
            });
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Editar perfil</Text>


                <TouchableOpacity onPress={handleUploadImage} style={styles.imageWrapper}>
                    <Image
                        source={{ uri: image || "https://cdn-icons-png.flaticon.com/512/67/67353.png" }}
                        style={styles.image}
                    />
                    <Text style={styles.changeText}>Cambiar foto</Text>
                </TouchableOpacity>


                <TextInput
                    style={styles.input}
                    placeholder="Nombre"
                    placeholderTextColor={colors.letraSecundaria}
                    value={nombre}
                    onChangeText={setNombre}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Apellidos"
                    placeholderTextColor={colors.letraSecundaria}
                    value={apellidos}
                    onChangeText={setApellidos}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Ciudad"
                    placeholderTextColor={colors.letraSecundaria}
                    value={ciudad}
                    onChangeText={setCiudad}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Correo"
                    placeholderTextColor={colors.letraSecundaria}
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />


                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveText}>Guardar cambios</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.fondo },
    container: {
        padding: RFPercentage(3),
        alignItems: "center",
    },
    title: {
        fontSize: fonts.title,
        color: colors.letraTitulos,
        marginBottom: RFPercentage(3),
    },
    imageWrapper: {
        alignItems: "center",
        marginBottom: RFPercentage(3),
    },
    image: {
        width: RFPercentage(18),
        height: RFPercentage(18),
        borderRadius: RFPercentage(9),
        backgroundColor: "#eee",
        marginBottom: RFPercentage(1),
    },
    changeText: {
        color: colors.botonFondo,

        fontSize: RFPercentage(2),
    },
    input: {
        width: "100%",
        backgroundColor: colors.fondoSecundario,
        borderRadius: RFPercentage(1.5),
        padding: RFPercentage(1.5),
        marginBottom: RFPercentage(2),
        fontSize: fonts.normal,
        color: colors.letraSecundaria,
    },
    saveBtn: {
        backgroundColor: colors.botonFondo,
        borderRadius: RFPercentage(2),
        paddingVertical: RFPercentage(1.8),
        paddingHorizontal: RFPercentage(5),
        alignItems: "center",
        marginTop: RFPercentage(2),
    },
    saveText: {
        fontSize: fonts.medium,
        color: "#fff"
    },
});

export default EditarPerfil;
