import { View, Text, TextInput,StyleSheet ,Button,Alert, Touchable, TouchableOpacity} from 'react-native'
import React ,{useState}from 'react'
import CustomInput from '../components/CustomImput'
import { colors } from '../Styles/Colors';
import { UserDataLogin} from '../types/User';
import { loginUser, registerUser } from '../services/user/userService';
import ScreenContainer from '../components/ScreemContainer';
import Title from '../components/Title';
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import DeviceInfo from 'react-native-device-info';
export default function Login() {
  const {login}=useAuthStore();
  const navigation=useNavigation<any>();
  const [formData, setFormData] = useState({
    email:"",
    password:"",
  });

  const handleChange=(field:string,value:string)=>{
    setFormData(prev=>({...prev,[field]:value}));
  };

    const handleLogin=async()=>{
      const {email,password}=formData;
      if(!email||!password){
         Alert.alert("Error","Por favor completa los campos obligatorios");
         return;
      };
      const uniqueId = await DeviceInfo.getUniqueId();
    const brand = DeviceInfo.getBrand();
    const model = DeviceInfo.getModel();
        const userDataLogin:UserDataLogin={
                  email,
                  password,
                   deviceInfo: `${brand} ${model} (${uniqueId})`,
              };
            
          try{
            const response=await loginUser(userDataLogin);
              login({
                user:response.user,
                token:response.token,
                refreshToken:response.refreshToken,
              });
          

          }catch(error:any){
              Alert.alert('Error', error.response?.data?.error || 'Error desconocido');
          }


          };

       


  return (
    <>
    <ScreenContainer>
      <Title text='Swaplt'/>
      <CustomInput placeholder='Email' value={formData.email} onChangeText={value=>handleChange("email",value)} keyboardType='email-address'/>
      <CustomInput placeholder='Contraseña' value={formData.password} onChangeText={value=>handleChange("password",value)} secureTextEntry/>  
      <View style={styles.buttonContainer}>
      <CustomButton title="Acceder" onPress={handleLogin} />
    </View>

      <TouchableOpacity onPress={()=>navigation.navigate("Register")}>
        <Text style={styles.registerText}>
              ¿No tienes cuenta? <Text style={styles.linkText}>Regístrate</Text>
        </Text>

      </TouchableOpacity>
    </ScreenContainer>
    </>
  )
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: "85%",          
    alignItems: "flex-end", 
    marginTop: 10,
  },
    registerText: {
    marginTop: 20,
    color: colors.letraSecundaria,
    textAlign: "center",
  },
  linkText: {
    color: colors.letraTitulos,
    fontWeight: "bold",
  },
});
