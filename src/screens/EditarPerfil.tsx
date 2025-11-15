import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useAuthStore } from "../store/useAuthStore";
import { colors } from "../Styles/Colors";
import { fonts } from "../Styles/Fonts";
import { editUser } from "../services/user/userService";

const EditarPerfil = ({ navigation }: any) => {
    const { user, perfil, setPerfil } = useAuthStore();
    const [nombre, setNombre] = useState(perfil?.nombre || "");
    const [apellidos, setApellidos] = useState(perfil?.apellidos || "");
    const [ciudad, setCiudad] = useState(perfil?.ciudad || "");
    const [email, setEmail] = useState(perfil?.email?.toString() || "")
    const [fotoPerfil, setFotoPerfil] = useState(perfil?.fotoPerfil?.toString() || "")
    const handleSave = async () => {
        try {
            const updated = await editUser({
                nombre,
                apellidos,
                ciudad,
                email,
                fotoPerfil,
            });
            setPerfil(updated);
            Alert.alert("Éxito", "Perfil actualizado correctamente");
            navigation.goBack();
        } catch (error) {
            console.log(error);
            Alert.alert("Error", "No se pudo actualizar el perfil");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Editar perfil</Text>

            <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={nombre}
                onChangeText={setNombre}
            />
            <TextInput
                style={styles.input}
                placeholder="Apellidos"
                value={apellidos}
                onChangeText={setApellidos}
            />
            <TextInput
                style={styles.input}
                placeholder="Ciudad"
                value={ciudad}
                onChangeText={setCiudad}
            />

            <TextInput
                style={styles.input}
                placeholder="Correo"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>Guardar cambios</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.fondo,
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.letraTitulos,
        marginBottom: 20,
    },
    input: {
        backgroundColor: colors.fondoSecundario,
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        color: colors.letraSecundaria,
    },
    saveBtn: {
        backgroundColor: colors.botonFondo,
        borderRadius: 10,
        padding: 12,
        alignItems: "center",
    },
    saveText: {
        color: "#fff",
        fontWeight: "bold",
    },
});

export default EditarPerfil;
