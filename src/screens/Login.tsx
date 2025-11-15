import { View, Text, TextInput, StyleSheet, Button, Alert, Touchable, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import CustomInput from '../components/CustomImput'
import { colors } from '../Styles/Colors';
import { UserDataLogin } from '../types/User';
import { loginUser, registerUser } from '../services/user/userService';
import ScreenContainer from '../components/ScreemContainer';
import Title from '../components/Title';
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import DeviceInfo from 'react-native-device-info';

import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { RFValue, RFPercentage } from "react-native-responsive-fontsize";
import { fonts } from '../Styles/Fonts';
import Toast from 'react-native-toast-message';

export default function Login() {
  const { login } = useAuthStore();
  const navigation = useNavigation<any>();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    const { email, password } = formData;
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa los campos obligatorios");
      return;
    };
    const uniqueId = await DeviceInfo.getUniqueId();
    const brand = DeviceInfo.getBrand();
    const model = DeviceInfo.getModel();
    const userDataLogin: UserDataLogin = {
      email,
      password,
      deviceInfo: `${brand} ${model} (${uniqueId})`,
    };

    try {
      const response = await loginUser(userDataLogin);
      login({
        user: response.user,
        token: response.token,
        refreshToken: response.refreshToken,
      });
      Toast.show({
        type: "success",
        text1: "Inicio de sesión correcto",
        text2: `Bienvenido ${response.user.nombre}`,
      });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Error desconocido');
    }

  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.fondo }}>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >

          <ScreenContainer>
            <Title text='Swaplt' />
            <CustomInput placeholder='Email' value={formData.email} onChangeText={value => handleChange("email", value)} keyboardType='email-address' />
            <CustomInput placeholder='Contraseña' value={formData.password} onChangeText={value => handleChange("password", value)} secureTextEntry />
            <View style={styles.buttonContainer}>
              <CustomButton title="Acceder" onPress={handleLogin} />
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerText}>
                ¿No tienes cuenta? <Text style={styles.linkText}>Regístrate</Text>
              </Text>
            </TouchableOpacity>
          </ScreenContainer>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: "85%",
    alignItems: "flex-end",
    marginTop: RFValue(10),
  },
  registerText: {
    marginTop: RFPercentage(2),
    color: colors.letraSecundaria,
    textAlign: "center",
    fontSize: fonts.medium,
  },
  linkText: {
    color: colors.letraTitulos,
    fontWeight: "bold",
    fontSize: fonts.medium,
  },
});
