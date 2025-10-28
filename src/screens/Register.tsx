import { View, TextInput,Button,Alert,StyleSheet,Text, TouchableOpacity, TouchableWithoutFeedback, Image} from 'react-native'
import React,{useState} from 'react'
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
export default function Register() {
  const navigation = useNavigation<any>();

  const [formData,setFormData]=useState({
    nombre:"",
    apellidos:"",
    fechaNacimiento: new Date(),
    edad:"",
    ciudad:"",
    email:"",
    password:"",
    fotoPerfil:"",

  });

  const  [showDatePicker, setShowDatePicker] = useState(false);
  const [image, setImage] = useState <string|null>(null);

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
     
      const response = await api.post("/cloud/upload",formData,{
        headers:{
          'Content-Type':"multipart/form-data",
        },
      })
    Alert.alert('Éxito', 'Imagen subida correctamente');
    setImage(response.data.url);
      return response.data.url;
   
    } catch (error) {
      console.log('Error al subir imagen:', error);
      Alert.alert('Error', 'No se pudo subir la imagen');
    }
  };

  const handleChange=(field:string,value:string)=>{
    setFormData(prev=>({...prev,[field]:value}));
  }

    const handleRegister=async()=>{
      const {nombre,apellidos,ciudad,email,password,fechaNacimiento}=formData;

      if(!nombre||!apellidos||!email||!password || !fechaNacimiento){
        Alert.alert("Error","Por favor completa los campos obligatorios");
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

        try{
            const user=await registerUser(userData);
            Alert.alert('Registro exitoso', `Bienvenido ${user.nombre}`);
        }catch(error:any){
             Alert.alert('Error', error.response?.data?.error || 'Error desconocido');
        }
    };

      const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData((prev) => ({ ...prev, fechaNacimiento: selectedDate }));
    }
  };
  return (
    <>
    
<ScreenContainer>
      <Title text='Swaplt'/>
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

      <CustomInput placeholder='Nombre' value={formData.nombre} onChangeText={value=>handleChange("nombre",value)}/>
      <CustomInput placeholder='Apellidos' value={formData.apellidos} onChangeText={value=>handleChange("apellidos",value)}/>
      <CustomInput placeholder='Ciudad' value={formData.ciudad} onChangeText={value=>handleChange("ciudad",value)}/>
      <CustomInput placeholder='Email' value={formData.email} onChangeText={value=>handleChange("email",value)} keyboardType='email-address'/>
      <CustomInput placeholder='Password' value={formData.password} onChangeText={value=>handleChange("password",value)} secureTextEntry/>

    
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={CustomInputStyles.input}>
        <Text style={styles.dateText}>
          Fecha de nacimiento:{" "}
          {formData.fechaNacimiento.toLocaleDateString("es-ES")}
        </Text>
      </TouchableOpacity>

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
    </>
  )
}


const styles = StyleSheet.create({

  dateInput: {
    backgroundColor: colors.fondo,
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
  },
  dateText: {
    fontSize:fonts.medium,
    color: colors.letraSecundaria,
  },

 avatarContainer:{
    alignSelf:'center',
    marginBottom:20,
  },
  avatar:{
    width:100,
    height:100,
    borderRadius:50,
  },
  avatarPlaceholder:{
    width:100,
    height:100,
    borderRadius:50,
    backgroundColor:colors.fondo,
    justifyContent:'center',
    alignItems:'center',
  },
  avatarText:{
    fontSize:40,
    color:colors.letraSecundaria,
  },


  buttonContainer: {
    width: "85%",          
    alignItems: "flex-end", 
    marginTop: 10,
  },

    loginText: {
    marginTop: 20,
    color: colors.letraSecundaria,
    textAlign: "center",
  },
  linkText: {
    color: colors.letraTitulos,
    fontWeight: "bold",
  },
});