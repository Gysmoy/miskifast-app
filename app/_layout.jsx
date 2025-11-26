import { useEffect, useState } from 'react';
import { router, SplashScreen, Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { CartProvider } from '@/src/context/CartContext';
import * as SecureStore from 'expo-secure-store';
import { ActivityIndicator, Image, Text, TextInput } from 'react-native';
import AuthRest from '@/src/data/AuthRest'
import isotipo from '@/assets/images/isotipo.png'
import { APP_NAME } from '@/constants/settings';
import AppText from "@/components/app-text"
import { SafeAreaView } from 'react-native-safe-area-context';

const authRest = new AuthRest()
let redirected = false;

export default function RootLayout() {
  useFrameworkReady();

  const [isAuthenticated, setIsAuthenticated] = useState(null); // null: verifying, true/false: done
  const [fontsLoaded] = useFonts({
    'Sen-Regular': require('@/assets/fonts/Sen-Regular.ttf'),
    'Sen-Medium': require('@/assets/fonts/Sen-Medium.ttf'),
    'Sen-SemiBold': require('@/assets/fonts/Sen-SemiBold.ttf'),
    'Sen-Bold': require('@/assets/fonts/Sen-Bold.ttf'),
    'Sen-ExtraBold': require('@/assets/fonts/Sen-ExtraBold.ttf'),
  });

  useEffect(() => {
    const verifySession = async () => {
      try {
        const result = await authRest.verify();
        if (!result) throw new Error('No session');
        await SecureStore.setItemAsync('session', JSON.stringify(result));
        setIsAuthenticated(true);
      } catch (err) {
        setIsAuthenticated(false);
      }
    }
    verifySession();
  }, [null]);

  useEffect(() => {
    if (isAuthenticated === null || redirected) return;
    redirected = true;
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, redirected]);

  useEffect(() => {
    if (fontsLoaded) {
      Text.defaultProps = Text.defaultProps || {};
      Text.defaultProps.style = { fontFamily: 'Sen-Regular' };
      TextInput.defaultProps = TextInput.defaultProps || {};
      TextInput.defaultProps.style = { fontFamily: 'Sen-Regular' };
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return <>
    {
      isAuthenticated === null
        ? <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
          <Image
            source={isotipo}
            style={{ width: 80, height: 80, marginBottom: 16 }}
            resizeMode="contain"
          />
          <ActivityIndicator size="large" color="#FF4D4F" />
          <AppText weight='Bold' style={{ marginTop: 12, fontSize: 20, color: '#333' }}>{APP_NAME}</AppText>
          <AppText style={{ marginTop: 8, fontSize: 14, color: '#666' }}>Verificando sesión...</AppText>
        </SafeAreaView>
        : <CartProvider isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}>
          <Stack screenOptions={{ headerShown: false, backgroundColor: '#ffffff' }}>
            {/* {isAuthenticated ? (
              <> */}
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="search" options={{ headerShown: false }} />
                <Stack.Screen name="category/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="restaurant/[id]" options={{ headerShown: false }} />
              {/* </>
            ) : (
              <> */}
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              {/* </>
            )} */}
            <Stack.Screen name="+not-found" />
          </Stack>
          {/* <StatusBar translucent backgroundColor="#121223" barStyle="light-content" /> */}
        </CartProvider>
    }
  </>
}
