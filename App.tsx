import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { useAuthStore } from "./src/store/useAuthStore";
import { useEffect, useState } from "react";
import { refreshUserToken } from "./src/services/user/userService";
import AuthStack from "./src/navigation/AuthStack";
import MainStack from "./src/navigation/MainStack";
import { MenuProvider } from "react-native-popup-menu";

import { StripeProvider } from "@stripe/stripe-react-native";

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
          const response = await refreshUserToken(refreshToken);
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
        if (!canceled) setLoading(false);
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
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
      <SafeAreaProvider>
      <MenuProvider>
       <StripeProvider publishableKey="pk_test_51SNFIgKm7K5gaMmaD9dKeym453awlGKkNgKmDMVP1TUc3ZGxpxTAViaU8iBvRJ59zB3PeSgxcc6G3dXfOaMf7Oqu00jQEa9URC">
        <NavigationContainer>
          {token ? <MainStack /> : <AuthStack />}
        </NavigationContainer>
        </StripeProvider>
      </MenuProvider>
    </SafeAreaProvider>
  );
}

export default App;
