import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator, Image } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { useAuthStore } from "./src/store/useAuthStore";
import { useEffect, useState } from "react";
import { refreshUserToken } from "./src/services/user/userService";
import AuthStack from "./src/navigation/AuthStack";
import MainStack from "./src/navigation/MainStack";
import { MenuProvider } from "react-native-popup-menu";
import Toast, { ErrorToast } from "react-native-toast-message";
import { StripeProvider } from "@stripe/stripe-react-native";
import { StatusBar } from "react-native";
// import RNBootSplash from "react-native-bootsplash";

// const toastConfig = {
//   error: (props: any) => (
//     <ErrorToast
//       {...props}
//       text1NumberOfLines={5}
//       text2NumberOfLines={5}
//       style={{ height: 'auto', minHeight: 80 }}
//       text1Style={{ fontSize: 15 }}
//       text2Style={{ fontSize: 13 }}
//     />
//   ),
// };
function App() {
  const { token, refreshToken, login, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
useEffect(() => {
  let canceled = false;

  const initAuth = async () => {
    try {
      await new Promise<void>((resolve) => {
        useAuthStore.persist.onFinishHydration(() => resolve());
      });

      if (refreshToken) {
        const cleanToken = refreshToken.trim().replace(/[\s\r\n]+/g, "");
        const response = await refreshUserToken(cleanToken);
        if (canceled) return;

        login({
          user: response.user,
          token: response.token,
          refreshToken: response.newRefreshToken,
        });
      }
    } catch (error) {
      logout();
    } finally {
      if (!canceled) {
        setLoading(false);
        // RNBootSplash.hide({ fade: true }); 
      }
    }
  };

  initAuth();
  return () => {
    canceled = true;
  };
}, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        
      <Image
        source={require("./src/assets/logo.png")} 
        style={{ width: 150, height: 150 }}
        resizeMode="contain"
      />
  
      </View>
    );
  }

  return (
    <GestureHandlerRootView >
          <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" /> 
      <SafeAreaProvider>
        <MenuProvider>
          <StripeProvider publishableKey="pk_test_51SNFIgKm7K5gaMmaD9dKeym453awlGKkNgKmDMVP1TUc3ZGxpxTAViaU8iBvRJ59zB3PeSgxcc6G3dXfOaMf7Oqu00jQEa9URC">
            <NavigationContainer>
              {token ? <MainStack /> : <AuthStack />}
            </NavigationContainer>
            {/* <Toast config={toastConfig} /> */}
            <Toast />
          </StripeProvider>
        </MenuProvider>
      </SafeAreaProvider>
      
    </GestureHandlerRootView>
  );
}

export default App;
