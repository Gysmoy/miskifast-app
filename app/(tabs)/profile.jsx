import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { useCart } from '@/src/context/CartContext';
import { APP_URL } from '../../constants/settings';
import AuthRest from '../../src/data/AuthRest'
import { router } from 'expo-router';
import AppText from "@/components/app-text"
import MenuContainer from '../../components/menu/menu-container';
import MenuItem from '../../components/menu/menu-item';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as SecureStore from 'expo-secure-store';
import OffCanvas from '../../components/off-canvas';
import ProfilePicture from '../../components/profile/profile-picture';

const authRest = new AuthRest()

export default function ProfileScreen() {
  const { session, setIsAuthenticated } = useCart();
  const [modalVisible, setModalVisible] = useState(false);
  const [canvasOpen, setCanvasOpen] = useState(false);

  const onLogoutClicked = async () => {
    const result = await authRest.logout()
    if (!result) return
    setIsAuthenticated(false)
    router.replace('/login')
  };

  const openImageModal = () => {
    setModalVisible(true);
  };

  const closeImageModal = () => {
    setModalVisible(false);
  };

  const handleModifyImage = async () => {
    closeImageModal();

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permisos requeridos', 'Se necesita acceso a la galería para seleccionar una imagen.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    try {
      const uri = result.assets[0].uri;
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // 🧠 Armar FormData correctamente
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: filename,
        type,
      });

      // 🔐 Si tienes token de autenticación, agrégalo aquí
      const bearerToken = await SecureStore.getItemAsync('bearerToken');

      // 🚀 Hacer el fetch directo con multipart/form-data
      const response = await fetch(`${APP_URL}/app/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
          // ❌ No pongas 'Content-Type' manualmente: fetch la genera sola con boundary
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.log('❌ Error:', data);
        throw new Error(data.message || 'Error al actualizar el perfil');
      }

      Alert.alert('✅ Imagen actualizada', 'Tu imagen de perfil se ha actualizado correctamente.');
    } catch (error) {
      console.trace(error);
      Alert.alert('Error', 'No se pudo actualizar la imagen de perfil.');
    }
  };


  const handleDownloadImage = async () => {
    closeImageModal();

    const uri = `${APP_URL}/api/profile/thumbnail/${session.relative_id}`;
    const filename = `profile_${session.relative_id}.jpg`;

    try {
      // Pide permisos de MediaLibrary
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'Se necesita acceso a la galería para guardar la imagen.');
        return;
      }

      // Descarga en caché temporal (sí está permitido)
      const fileUri = FileSystem.cacheDirectory + filename;
      const { uri: localUri } = await FileSystem.downloadAsync(uri, fileUri);

      // Crea el asset en la galería
      const asset = await MediaLibrary.createAssetAsync(localUri);
      await MediaLibrary.createAlbumAsync('Descargas', asset, false);

      Alert.alert('Descarga completada', 'La imagen se ha guardado en tu galería.');
    } catch (error) {
      console.error("❌ Error descargando imagen:", error);
      Alert.alert('Error', 'No se pudo descargar la imagen.');
    }
  };


  return (<>
    <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <ScrollView style={{
        flex: 1, padding: 24,
        backgroundColor: '#ffffff'
      }} showsVerticalScrollIndicator={false}>
        <ProfilePicture {...session} />

        <MenuContainer>
          <MenuItem icon='person-outline' color='#FB6F3D' onPress={() => router.push('/(profile)/personal-info')}>Información Personal</MenuItem>
          <MenuItem icon='location-outline' color='#413DFB' onPress={() => router.push('/(profile)/addresses')}>Mis Direcciones</MenuItem>
          <MenuItem icon='phone-portrait-outline' color='#28A745' onPress={() => router.push('/(profile)/devices')}>Dispositivos</MenuItem>
        </MenuContainer>

        <MenuContainer>
          <MenuItem icon='cart-outline' color='#369BFF' onPress={() => router.push('/cart')}>Mi carrito</MenuItem>
          <MenuItem icon='time-outline' color='#FFAA2A' onPress={() => router.push('/(tabs)/orders')}>Historial de pedidos</MenuItem>
          <MenuItem icon='heart-outline' color='#B33DFB' onPress={() => router.push('/(tabs)/fav')}>Favoritos</MenuItem>
        </MenuContainer>

        {/* <MenuContainer>
          <MenuItem icon='help-circle-outline' color='#FB6D3A'>Preguntas Frecuentes</MenuItem>
          <MenuItem icon='star-outline' color='#2AE1E1'>Reseñas de Usuario</MenuItem>
          <MenuItem icon='settings-outline' color='#413DFB'>Configuración</MenuItem>
        </MenuContainer> */}

        <MenuContainer>
          <MenuItem icon='log-out-outline' color='#FB4A59' onPress={onLogoutClicked}>Cerrar Sesión</MenuItem>
        </MenuContainer>

        <View style={{ alignItems: 'center' }}>
          <AppText style={{ fontSize: 14, color: '#747783' }}>Versión 1.0.0</AppText>
        </View>
      </ScrollView>

    </View>
    <Modal
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeImageModal}
      animationType="fade"
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 20,
          alignItems: 'center',
          width: '80%',
          maxWidth: 350,
        }}>
          <Image
            source={{ uri: `${APP_URL}/api/profile/thumbnail/${session.relative_id}` }}
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              marginBottom: 20,
            }}
            resizeMode="contain"
          />
          <View style={{
            flexDirection: 'row',
            marginBottom: 10,
          }}>
            <TouchableOpacity style={{
              backgroundColor: '#FB6F3D',
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 8,
              marginHorizontal: 10,
            }} onPress={handleModifyImage}>
              <AppText weight='Bold' style={{
                color: '#fff',
                fontSize: 14,
              }}>Modificar</AppText>
            </TouchableOpacity>
            <TouchableOpacity style={{
              backgroundColor: '#FB6F3D',
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 8,
              marginHorizontal: 10,
            }} onPress={handleDownloadImage}>
              <AppText weight='Bold' style={{
                color: '#fff',
                fontSize: 14,
              }}>Descargar</AppText>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{
            marginTop: 10,
          }} onPress={closeImageModal}>
            <AppText style={{
              color: '#747783',
              fontSize: 14,
            }}>Cerrar</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    <OffCanvas isOpen={canvasOpen} title='Hola' onClose={() => setCanvasOpen(false)}>
      <AppText>Hola mundo</AppText>
      <View style={{
        padding: 24
      }}>
        <AppText>Nuevo texto por aquí Lorem ipsum dolor sit, amet consectetur adipisicing elit. Veritatis, quis nostrum? Porro doloribus magnam, modi delectus adipisci soluta saepe hic ipsa voluptatem, laborum, quod officiis nobis at cumque facere iusto?</AppText>
      </View>
    </OffCanvas>
  </>
  );
}
