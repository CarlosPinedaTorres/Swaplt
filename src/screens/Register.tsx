import { View, TextInput, Button, Alert, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, Image, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { UserData } from '../types/User';
import { registerUser } from '../services/user/userService';
import CustomInput from '../components/CustomImput';
import { colors } from '../Styles/Colors';
import ScreenContainer from '../components/ScreemContainer';
import Title from '../components/Title';
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import api from '../services/api';
import DateTimePicker from "@react-native-community/datetimepicker";
import CustomInputStyles from '../components/CustomInput.styles';
import { fonts } from '../Styles/Fonts';

import { RFValue, RFPercentage } from "react-native-responsive-fontsize";
import { SafeAreaView } from "react-native-safe-area-context";

import { KeyboardAvoidingView, Platform } from 'react-native';
import Toast from 'react-native-toast-message';

export default function Register() {

  const [errors, setErrors] = useState({
    nombre: '',
    apellidos: '',
    ciudad: '',
    email: '',
    password: '',
    fechaNacimiento: '',
  });


  const navigation = useNavigation<any>();
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    fechaNacimiento: new Date(),
    edad: "",
    ciudad: "",
    email: "",
    password: "",
    fotoPerfil: "",

  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const calcularEdad = (fecha: Date) => {

    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const m = hoy.getMonth() - fecha.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) {
      edad--;
    }
    return edad;
  };


  const handleUploadImage = async () => {

    const result = await launchImageLibrary({ mediaType: 'photo' });

    if (!result.assets || result.assets.length === 0) return;

    const photo = result.assets[0];

    const formData = new FormData();
    formData.append('image', {
      uri: photo.uri,
      type: photo.type,
      name: photo.fileName,
    } as any);

    try {

      const response = await api.post("/cloud/upload", formData, {
        headers: {
          'Content-Type': "multipart/form-data",
        },
      })

      setImage(response.data.url);
      return response.data.url;

    } catch (error) {
      console.log('Error al subir imagen:', error);

    }
  };


  const validatePassword = (pwd: string) => {
    const errors: string[] = [];

    if (pwd.length < 8) errors.push("Debe tener al menos 8 caracteres.");
    if (!/[a-z]/.test(pwd)) errors.push("Debe incluir una letra minúscula.");
    if (!/[A-Z]/.test(pwd)) errors.push("Debe incluir una letra mayúscula.");
    if (!/[0-9]/.test(pwd)) errors.push("Debe incluir un número.");
    if (!/[!@#$%^&*()_\-+\=\[\]{};':"\\|,.<>\/?`~]/.test(pwd))
      errors.push("Debe incluir un carácter especial.");

    if (errors.length === 0) return { valid: true, message: null };
    return { valid: false, message: errors.join("\n") };
  };




  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    if (field === "password") {

      setPasswordTouched(true);
      const { valid, message } = validatePassword(value);
      setPasswordError(valid ? null : message);
    }
  }
  const validateFechaNacimiento = (fecha: Date) => {
    if (!fecha || isNaN(fecha.getTime())) {
      return "Fecha inválida";
    }

    const edad = calcularEdad(fecha);
    if (edad < 18) {
      return "Debes tener al menos 18 años";
    }

    return null;
  };
  const handleRegister = async () => {
    const { nombre, apellidos, ciudad, email, password, fechaNacimiento } = formData;
    const newErrors: any = {};
    if (!formData.nombre) newErrors.nombre = 'Nombre es obligatorio';
    if (!formData.apellidos) newErrors.apellidos = 'Apellidos son obligatorios';
    if (!formData.ciudad) newErrors.ciudad = 'Ciudad es obligatoria';
    if (!formData.email) newErrors.email = 'Email es obligatorio';
    if (!formData.password) newErrors.password = 'Contraseña es obligatoria';
    const fechaError = validateFechaNacimiento(formData.fechaNacimiento);
    if (fechaError) newErrors.fechaNacimiento = fechaError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    const { valid, message } = validatePassword(formData.password);
    if (!valid) {
      setErrors(prev => ({ ...prev, password: message || '' }));

      return;
    }




    const edad = calcularEdad(fechaNacimiento);
    const userData: UserData = {
      nombre,
      apellidos,
      fechaNacimiento: new Date(fechaNacimiento).toISOString(),
      edad,
      ciudad,
      email,
      password,
      fotoPerfil: image || null,
    };

    try {
      const user = await registerUser(userData);
      Toast.show({
        type: "success",
        text1: "Registro exitoso",
        text2: `Bienvenido ${user.nombre}`,
      });
      setTimeout(() => {
        navigation.navigate("Login");
      }, 2000);

    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.error || "Error desconocido",
      });
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData((prev) => ({ ...prev, fechaNacimiento: selectedDate }));
      setErrors(prev => ({ ...prev, fechaNacimiento: '' }));
    }
  };
  return (

    <SafeAreaView style={{ flex: 1, backgroundColor: colors.fondo }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >



          <ScreenContainer>
            <Title text='Swaplt' />
            <TouchableWithoutFeedback onPress={handleUploadImage}>
              <View style={styles.avatarContainer}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>+</Text>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>


            <View style={{ flexShrink: 1 }}>
              {errors.nombre ? <Text style={styles.errorText}>{errors.nombre}</Text> : null}
              <CustomInput placeholder='Nombre' value={formData.nombre} onChangeText={value => handleChange("nombre", value)} />

            </View>
            <View style={{ flexShrink: 1 }}>
              {errors.apellidos ? <Text style={styles.errorText}>{errors.apellidos}</Text> : null}
              <CustomInput placeholder='Apellidos' value={formData.apellidos} onChangeText={value => handleChange("apellidos", value)} />

            </View>
            <View style={{ flexShrink: 1 }}>
              {errors.ciudad ? <Text style={styles.errorText}>{errors.ciudad}</Text> : null}
              <CustomInput placeholder='Ciudad' value={formData.ciudad} onChangeText={value => handleChange("ciudad", value)} />

            </View>
            <View style={{ flexShrink: 1 }}>
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

              <CustomInput placeholder='Email' value={formData.email} onChangeText={value => handleChange("email", value)} keyboardType='email-address' />
            </View>
            <View style={{ flexShrink: 1 }}>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
              <CustomInput placeholder='Password' value={formData.password} onChangeText={value => handleChange("password", value)} secureTextEntry />

            </View>
            <View style={{ flexShrink: 1 }}>

              {errors.fechaNacimiento ? (
                <Text style={styles.errorText}>{errors.fechaNacimiento}</Text>
              ) : null}
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={CustomInputStyles.input}>
                <Text style={styles.dateText}>
                  Fecha de nacimiento:{" "}
                  {formData.fechaNacimiento.toLocaleDateString("es-ES")}
                </Text>
              </TouchableOpacity>

            </View>
            {showDatePicker && (
              <DateTimePicker
                value={formData.fechaNacimiento}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={handleDateChange}
              />
            )}
            <View style={styles.buttonContainer}>
              <CustomButton title="Registrarse" onPress={handleRegister} />
            </View>

            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginText}>
                ¿Ya tienes cuenta? <Text style={styles.linkText}>Inicia sesión</Text>
              </Text>
            </TouchableOpacity>

          </ScreenContainer>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  errorText: {
    color: colors.error,
    fontSize: fonts.small,
    padding: RFValue(4),
  },

  dateInput: {
    backgroundColor: colors.fondo,
    borderRadius: RFValue(10),
    padding: RFValue(12),
    marginVertical: RFPercentage(1),
  },
  dateText: {
    fontSize: fonts.medium,
    color: colors.letraSecundaria,
  },
  avatarContainer: {
    alignSelf: "center",
    marginBottom: RFPercentage(3),
  },
  avatarPlaceholder: {
    width: RFPercentage(12),
    height: RFPercentage(12),
    borderRadius: RFPercentage(6),
    backgroundColor: colors.fondo,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: RFValue(100),
    height: RFValue(100),
    borderRadius: RFValue(50),
  },
  avatarText: {
    fontSize: fonts.large,
    color: colors.letraSecundaria,
  },

  buttonContainer: {
    width: "85%",
    alignItems: "flex-end",
    marginTop: RFValue(10),
  },

  loginText: {
    marginTop: RFValue(20),
    color: colors.letraSecundaria,
    textAlign: "center",
    fontSize: fonts.medium,
  },
  linkText: {
    color: colors.letraTitulos,
    fontWeight: "bold",
  },
});