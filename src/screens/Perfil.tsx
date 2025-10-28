import { FlatList,View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import React, { useState,useEffect } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuthStore } from '../store/useAuthStore';
import { getUserProfile, logoutUser } from '../services/user/userService';
import { useNavigation } from '@react-navigation/native';
import { UserDataProfile } from '../types/User';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from "react-native-safe-area-context";
import { useProductStore } from '../store/useProductStore';
import { getMyProducts } from '../services/product/productService';



import { Dimensions } from "react-native";
import { colors } from '../Styles/Colors';

const { width, height } = Dimensions.get("window");

  const scaleFont = (size:number) => (width / 375) * size; 
const Perfil = () => {

const { productosUsuario, setProductosUsuario } = useProductStore();
  const { user, refreshToken, logout ,token,perfil,setPerfil} = useAuthStore();

  const navigation=useNavigation<any>();

  const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadProfileAndProducts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {

      if (!perfil) {
        const data = await getUserProfile(user.id);
        setPerfil(data);
      }


      const misProductos = await getMyProducts();
      setProductosUsuario(misProductos);

    } catch (err) {
      console.log("Error cargando perfil o productos:", err);
      if (!perfil) setPerfil(null);
    } finally {
      setLoading(false); 
    }
  };

  loadProfileAndProducts();
}, [user]);


  




//Actualizar info

// const handleUpdatePerfil = async (nuevosDatos) => {
//   try {
//     const updated = await updateUserProfile(user.id, nuevosDatos);
//     setPerfil(updated); //  actualiza el cache local
//   } catch (error) {
//     console.log("Error al actualizar perfil:", error);
//   }
// };

  
  

  //--------------------------------------------

  const handleLogout = async () => {
    try {
      console.log(refreshToken)
      if (!refreshToken) {
        logout();
        return;
      }

      await logoutUser(refreshToken);
      logout();
      Alert.alert("Sesión cerrada", "Has cerrado sesión correctamente.");
    } catch (error: any) {
      console.log(error);
      Alert.alert(
        "Error",
        error.response?.data?.error || "No se pudo cerrar sesión"
      );
    }
  };


//-----------------------------------------------

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.cargando} />
      </View>
    );
  }

  if (!perfil) {
    return (
      <View style={styles.center}>
        <Text>No se encontró información del perfil.</Text>
             <TouchableOpacity onPress={handleLogout}>
        <Text>Cerrar sesión</Text>
      </TouchableOpacity>
      </View>
    );
  }

  return (
     <SafeAreaView style={{ flex: 1, backgroundColor: colors.fondo }}>
   <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={perfil.fotoPerfil?{uri:perfil.fotoPerfil}:require("../assets/images/defaultProfile.png")}
          style={styles.avatar}
        />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.name}>{perfil.nombre} {perfil.apellidos}</Text>
          <Text style={styles.info}>{perfil.ciudad}, {perfil.edad}</Text>
          <Text style={styles.info}>{perfil.email}</Text>
        </View>
      </View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mis productos</Text>
        <TouchableOpacity onPress={() => navigation.navigate("AddProduct",{userId:perfil.id})}>
            <Ionicons name="add-circle-outline" size={width * 0.06} />

        </TouchableOpacity>
      </View>
  
     
        <Text>Mis productos</Text>

        <View style={styles.productsContainer}>
<FlatList
  data={productosUsuario}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ fontWeight: 'bold' }}>{item.nombre}</Text>
      <Text>{item.descripcion}</Text>
      <Text>{item.precio ? `$${item.precio}` : 'Sin precio'}</Text>
      <Text>{item.categoria.nombre} - {item.tipo.nombre} - {item.estado.nombre}</Text>
    </View>
  )}
  ListEmptyComponent={() => <Text>No tienes productos aún</Text>}
  contentContainerStyle={{ paddingBottom: 20 }}
  scrollEnabled={false} 
/>

</View>

   
            <TouchableOpacity onPress={handleLogout}>
        <Text>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
</SafeAreaView>

   
  );
};

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: colors.fondo,
  paddingHorizontal: width * 0.04, 
  paddingVertical: height * 0.02, 
},


sectionHeader: {
  flexDirection: "row",
  alignItems: "center", 
  marginBottom: 10,
},

sectionTitle: {
  fontSize: scaleFont(16),
  fontWeight: "600",
  color: colors.letraSecundaria,
},



  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
header: {
  flexDirection: "row",
  backgroundColor: colors.fondoSecundario,
  borderRadius: 10,
  padding: width * 0.04,
  marginBottom: Math.min(height * 0.02, 20),

},

avatar: {
  width: width * 0.2,   
  height: width * 0.2,
  borderRadius: (width * 0.2) / 2,
},

  name: {
    fontSize: scaleFont(18),
    fontWeight: "bold",
  },
  info: {
      fontSize: scaleFont(14),
    color: colors.infoLetra,
  },

productsContainer: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  backgroundColor: colors.fondoSecundario,
  borderRadius: 10,
  padding: width * 0.04,
},

});


export default Perfil;
