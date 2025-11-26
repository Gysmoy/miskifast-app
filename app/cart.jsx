import { View, ScrollView, TouchableOpacity, Image, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/src/context/CartContext';
import Number2Currency from '@/scripts/number2Currency';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import OrdersRest from '../src/data/OrdersRest';
import AddressesRest from '../src/data/AddressesRest';
import { STORAGE_URL } from '../constants/settings';
import AppText from "@/components/app-text"
import CartHeader from '../components/cart/cart-header';
import CartItem from '../components/cart/cart-item';
import AddressTags from '../src/data/AddresTags';
import AuthButton from '../components/auth/auth-button';

const ordersRest = new OrdersRest()
const addressesRest = new AddressesRest()
const addressTags = new AddressTags()

export default function CartScreen() {
  const { paymentMethods, cartItems, getTotalPrice, clearCart } = useCart();
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cashAmount, setCashAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Address management
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [addressModalVisible, setAddressModalVisible] = useState(false);

  const fetchAddresses = useCallback(async () => {
    setLoadingAddresses(true);
    const result = await addressesRest.all();
    setLoadingAddresses(false);
    setAddresses(result ?? []);
    // Only change selectedAddress if the current one no longer exists
    const currentStillExists = result?.some(addr => addr.id === selectedAddress?.id);
    if (!currentStillExists) {
      const defaultAddress = result?.find(addr => addr.is_default) || result?.[0];
      setSelectedAddress(defaultAddress);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega algunos productos para continuar');
      return;
    }
    setModalVisible(true);
  };

  const confirmOrder = async () => {
    if (!paymentMethod) {
      Alert.alert('Método de pago requerido', 'Por favor selecciona un método de pago');
      return;
    }
    if (paymentMethod === '8c7fd44b-b64f-47b8-a9e7-50d4922c50d8' && !cashAmount) {
      Alert.alert('Monto requerido', 'Por favor indica con cuánto pagarás');
      return;
    }
    if (paymentMethod === '8c7fd44b-b64f-47b8-a9e7-50d4922c50d8' && parseFloat(cashAmount) < getTotalPrice()) {
      Alert.alert('Monto insuficiente', 'El monto de pago debe ser mayor al total de la compra');
      return;
    }

    const order = {
      payment_method_id: paymentMethod,
      payment_method_note: paymentMethod === '8c7fd44b-b64f-47b8-a9e7-50d4922c50d8' ? `Pago con S/ ${Number2Currency(cashAmount)}` : undefined,
      address_id: selectedAddress?.id,
      items: cartItems.map(item => ({
        id: item.id,
        presentation_id: item.presentationId,
        quantity: item.quantity,
        observation: item.observation ?? null
      }))
    }
    setLoading(true);
    const result = await ordersRest.save(order);
    setLoading(false);
    setModalVisible(false);

    if (!result) return
    clearCart();
    router.replace(`/thanks/${result.id}`);
  };

  const formattedAddress = `${selectedAddress?.street} ${selectedAddress?.number}, ${selectedAddress?.district}, ${selectedAddress?.city}, ${selectedAddress?.department} - ${selectedAddress?.reference}`;
  const addressTag = addressTags.getById(formattedAddress?.tag)

  return (<>
    <View style={{ flex: 1, backgroundColor: '#121223' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 24 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ backgroundColor: 'rgba(255,255,255,.1)', borderRadius: 24, padding: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <AppText style={{ fontSize: 17, color: '#fff', marginLeft: 24 }}>Mi Carrito</AppText>
      </View>
      {
        cartItems.length > 0
          ? <>
            <ScrollView contentContainerStyle={{ padding: 24, rowGap: 24 }} showsVerticalScrollIndicator={false}>
              {/* Group items by restaurant */}
              {(() => {
                const byRestaurant = {};
                cartItems.forEach((it) => {
                  const key = it.restaurant.id || 'default';
                  if (!byRestaurant[key]) byRestaurant[key] = { name: it.restaurant.name, items: [] };
                  byRestaurant[key].items.push(it);
                });
                const groups = Object.values(byRestaurant);
                const showHeaders = groups.length > 1;

                return groups.map((group) => {
                  const groupTotal = group.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
                  return (
                    <View key={group.name} style={{ rowGap: 16 }}>
                      {showHeaders && <CartHeader name={group.name} amount={groupTotal} />}
                      {group.items.map((item) => <CartItem key={item.id} {...item} />)}

                    </View>
                  );
                });
              })()}
            </ScrollView>
            <View style={{ backgroundColor: '#fff', padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
              {/* Address section */}
              <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <AppText weight='SemiBold' style={{ fontSize: 14, color: '#32343E' }}>DIRECCIÓN DE ENTREGA</AppText>
                  {addresses.length > 1
                    ? <TouchableOpacity onPress={() => setAddressModalVisible(true)}>
                      <AppText style={{ fontSize: 14, color: '#E63946', textDecorationLine: 'underline' }}>CAMBIAR</AppText>
                    </TouchableOpacity>
                    : <TouchableOpacity onPress={() => router.push('/(profile)/addresses')}>
                      <AppText style={{ fontSize: 14, color: '#E63946', textDecorationLine: 'underline' }}>AGREGAR</AppText>
                    </TouchableOpacity>
                  }
                </View>
                <View style={{ backgroundColor: '#F0F5FA', paddingVertical: 18, paddingHorizontal: 18, borderRadius: 12 }}>
                  <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
                    <AppText style={{ fontSize: 14, color: '#32343E', textTransform: 'uppercase' }}>{selectedAddress?.name}</AppText>
                    <AppText style={{ fontSize: 14, color: 'rgba(50, 52, 62, 0.5)', textTransform: 'uppercase' }}>{addressTag?.pretty}</AppText>
                  </View>
                  <AppText style={{ fontSize: 14, color: '#32343E' }}>
                    {
                      loadingAddresses ? 'Cargando...'
                        : (selectedAddress
                          ? <>
                            <AppText>{selectedAddress?.street} {selectedAddress?.number}, {selectedAddress?.district}, {selectedAddress?.city}, {selectedAddress?.department}</AppText> <AppText style={{ color: 'rgba(50, 52, 62, 0.5)' }}>{selectedAddress?.reference}</AppText>
                          </>
                          : 'Selecciona una dirección')
                    }
                  </AppText>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <AppText style={{ fontSize: 14, color: '#A0A5BA' }}>TOTAL:</AppText>
                <AppText weight='ExtraBold' style={{ fontSize: 30, color: '#181C2E' }}>S/ {Number2Currency(getTotalPrice())}</AppText>
              </View>
              <AuthButton text='Realizar pedido' disabled={!selectedAddress} onPress={handleCheckout} />
            </View>

            {/* Address selection modal */}
            <Modal
              animationType="slide"
              transparent
              visible={addressModalVisible}
              statusBarTranslucent={true}
              onRequestClose={() => setAddressModalVisible(false)}
            >
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.6)', justifyContent: 'center', padding: 24 }}>
                <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 24, maxHeight: '80%' }}>
                  {/* Close button in top-right corner */}
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      zIndex: 1,
                      padding: 8,
                    }}
                    onPress={() => setAddressModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} color="#181C2E" />
                  </TouchableOpacity>

                  <AppText weight='Bold' style={{ fontSize: 20, marginBottom: 24, textAlign: 'center' }}>
                    Selecciona una dirección
                  </AppText>

                  {/* Scrollable content including addresses and close button */}
                  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                    {addresses.map((address) => {
                      const addressTag = addressTags.getById(address.tag)
                      return (
                        <TouchableOpacity
                          key={address.id}
                          style={{
                            paddingHorizontal: 18,
                            paddingVertical: 12,
                            borderWidth: 2,
                            borderColor: selectedAddress?.id === address.id ? '#E63946' : '#eee',
                            borderRadius: 12,
                            backgroundColor: selectedAddress?.id === address.id ? 'rgba(230, 57, 70, 0.05)' : '#fff',
                          }}
                          onPress={() => {
                            setSelectedAddress(address);
                            setAddressModalVisible(false);
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18, flex: 1 }}>
                            <Ionicons name={addressTag?.icon} size={20} color={addressTag?.color} />
                            <View style={{ flexShrink: 1, flex: 1 }}>
                              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
                                <AppText style={{ fontSize: 14, color: '#32343E', textTransform: 'uppercase' }}>{address.name}</AppText>
                                <AppText style={{ fontSize: 14, color: 'rgba(50, 52, 62, 0.5)', textTransform: 'uppercase' }}>{addressTag.pretty}</AppText>
                              </View>
                              <AppText style={{ flexWrap: 'wrap' }}>
                                <AppText>{address.street} {address.number}, {address.district}, {address.city}, {address.department}</AppText> <AppText style={{ color: 'rgba(50, 52, 62, 0.5)' }}>{address.reference}</AppText>
                              </AppText>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )
                    })}
                    <AuthButton text='Agregar nueva dirección' onPress={() => {
                      setAddressModalVisible(false)
                      router.push('/(profile)/addresses')
                    }} />
                  </ScrollView>
                </View>
              </View>
            </Modal>

            {/* Payment method modal */}
            <Modal
              animationType="slide"
              transparent
              visible={modalVisible}
              statusBarTranslucent={true}
              onRequestClose={() => setModalVisible(false)}
              style={{
                top: 0,
              }}
            >
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.6)', justifyContent: 'center', padding: 24 }}>
                <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 24 }}>
                  <AppText weight='Bold' style={{ fontSize: 20, marginBottom: 24, textAlign: 'center' }}>
                    Método de pago
                  </AppText>

                  {/* Payment method cards */}
                  <View style={{ marginBottom: 24 }}>
                    {paymentMethods.map((method) => {
                      const imageUrl = `${STORAGE_URL}/payment_method/${method.image}`;
                      return (
                        <TouchableOpacity
                          key={method.id}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 12,
                            paddingHorizontal: 18,
                            gap: 18,
                            borderWidth: 2,
                            borderColor: paymentMethod === method.id ? '#E63946' : '#eee',
                            borderRadius: 12,
                            marginBottom: 12,
                            backgroundColor: paymentMethod === method.id ? 'rgba(230, 57, 70, 0.05)' : '#fff',
                          }}
                          onPress={() => setPaymentMethod(method.id)}
                        >
                          <Image
                            source={{ uri: imageUrl }}
                            style={{
                              width: 48,
                              backgroundColor: '#98A8B8',
                              aspectRatio: 1,
                              resizeMode: 'contain',
                              borderRadius: 6
                            }}
                          />
                          <View style={{ flex: 1 }}>
                            <AppText style={{
                              fontSize: 16,
                              fontFamily: paymentMethod === method.id ? 'Sen-Bold' : 'Sen-SemiBold',
                              color: paymentMethod === method.id ? '#E63946' : '#181C2E'
                            }}>{method.name}</AppText>
                            <AppText style={{ fontSize: 14, color: '#646982', marginTop: 4 }}>{method.description}</AppText>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Cash amount input for cash payment */}
                  {paymentMethod === '8c7fd44b-b64f-47b8-a9e7-50d4922c50d8' && (
                    <View style={{ marginBottom: 24 }}>
                      <AppText style={{ fontSize: 16, marginBottom: 8, color: '#181C2E' }}>¿Con cuánto pagarás?</AppText>
                      <AppText style={{ fontSize: 14, color: '#646982', marginBottom: 12 }}>
                        Esto le permitirá al repartidor saber cuánto vuelto llevarte.
                      </AppText>
                      <TextInput
                        style={{
                          fontFamily: 'Sen-Regular',
                          fontSize: 16,
                          borderWidth: 1,
                          borderColor: '#ccc',
                          borderRadius: 12,
                          paddingHorizontal: 24,
                          paddingVertical: 18,
                          color: '#000'
                        }}
                        placeholder="Ej: 50"
                        placeholderTextColor="#888"
                        keyboardType="numeric"
                        value={cashAmount}
                        onChangeText={(text) => setCashAmount(text.replace(/[^0-9]/g, ''))}
                      />
                    </View>
                  )}

                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        paddingVertical: 14,
                        borderRadius: 12,
                        backgroundColor: '#eee',
                        alignItems: 'center',
                      }}
                      onPress={() => {
                        setModalVisible(false);
                        setPaymentMethod('');
                        setCashAmount('');
                      }}
                    >
                      <AppText weight='Bold' style={{ fontSize: 16, color: '#181C2E' }}>CANCELAR</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        paddingVertical: 14,
                        borderRadius: 12,
                        backgroundColor: '#E63946',
                        alignItems: 'center',
                      }}
                      onPress={confirmOrder}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <AppText weight='Bold' style={{ fontSize: 16, color: '#fff' }}>CONFIRMAR</AppText>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </>
          : <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
            <Ionicons name="cart-outline" size={80} color="#fff" />
            <AppText weight='Bold' style={{ fontSize: 20, color: '#fff', marginTop: 24 }}>Tu carrito está vacío</AppText>
            <AppText style={{ fontSize: 16, color: '#A0A5BA', marginTop: 12, textAlign: 'center' }}>Agrega algunos productos deliciosos</AppText>
          </View>
      }
    </View>
  </>);
}
