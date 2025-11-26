import React, { createContext, useContext, useEffect, useReducer, useState, useRef } from 'react';
import { View, ActivityIndicator, Image, Modal, TouchableOpacity } from 'react-native';
import CategoriesRest from '@/src/data/CategoriesRest';
import RestaurantsRest from '@/src/data/RestaurantsRest';
import PaymentMethodsRest from '@/src/data/PaymentMethodsRest';
import OrdersRest from '@/src/data/OrdersRest';
import StatusesRest from '@/src/data/statuses-rest';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import isotipo from '@/assets/images/isotipo.png'
import { APP_CORRELATIVE, APP_NAME, EVENTS_URL, APP_ENV } from '@/constants/settings';
import AppText from "@/components/app-text"
import ItemDetail from "@/components/items/item-detail"
import { SafeAreaView } from 'react-native-safe-area-context';
import PendingOrder from "@/components/order/pending-order"
import DeliveringOrder from "@/components/order/delivering-order"
import { io } from 'socket.io-client'
import AuthRest from '../data/AuthRest';
import { router } from 'expo-router';

const authRest = new AuthRest()
const categoriesRest = new CategoriesRest();
const restaurantsRest = new RestaurantsRest();
const paymentMethodsRest = new PaymentMethodsRest()
const ordersRest = new OrdersRest()
const statusesRest = new StatusesRest()

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      // Create unique key: id + presentationId
      const key = `${action.payload.id}-${action.payload.presentationId || 'default'}`;
      const existingIndex = state.findIndex(item => `${item.id}-${item.presentationId || 'default'}` === key);
      if (existingIndex >= 0) {
        const updated = [...state];
        updated[existingIndex] = { ...updated[existingIndex], quantity: updated[existingIndex].quantity + (action.payload.quantity || 1) };
        return updated;
      }
      // Only keep needed fields
      const minimal = {
        id: action.payload.id,
        presentationId: action.payload.presentationId || null,
        quantity: action.payload.quantity || 1,
        name: action.payload.name,
        presentation: action.payload.presentation || null,
        price: action.payload.price,
        image: action.payload.image,
        restaurant: action.payload.restaurant || null,
        observation: action.payload.observation || null,
      };
      return [...state, minimal];
    }

    case 'UPDATE_QUANTITY': {
      const key = `${action.payload.id}-${action.payload.presentationId || 'default'}`;
      if (action.payload.quantity <= 0) {
        return state.filter(item => `${item.id}-${item.presentationId || 'default'}` !== key);
      }
      return state.map(item =>
        `${item.id}-${item.presentationId || 'default'}` === key
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
    }

    case 'REMOVE_FROM_CART': {
      const itemId = action.payload.id
      const presentationId = action.payload.presentationId
      return state.filter(item => !(item.id == itemId && item.presentationId == presentationId));
    }

    case 'CLEAR_CART':
      return [];

    default:
      return state;
  }
};

export const CartProvider = ({ isAuthenticated, setIsAuthenticated, children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [cartItems, dispatch] = useReducer(cartReducer, []);
  const [selectedItem, setSelectedItem] = useState(null)

  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [session, setSession] = useState(null)
  const [appMode, setAppMode] = useState(null)

  // Modal state for cross-restaurant conflict
  const [conflictModal, setConflictModal] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);

  const [lastPendingOrder, setLastPendingOrder] = useState(null)
  const [availableOrders, setAvailableOrders] = useState([])

  // Socket ref and connection moved inside CartProvider
  const socketRef = useRef(null)

  const addToCart = (item) => {
    // Check if cart already has items from a different restaurant
    if (cartItems.length > 0) {
      const existingRestaurantId = cartItems[0].restaurant?.id;
      const newRestaurantId = item.restaurant?.id;
      if (existingRestaurantId && newRestaurantId && existingRestaurantId !== newRestaurantId) {
        setPendingItem(item);
        setConflictModal(true);
        return;
      }
    }
    proceedAddToCart(item);
  };

  const proceedAddToCart = (item) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
    Toast.show({
      text1Style: {
        fontFamily: 'Sen-Bold',
        fontSize: 15
      },
      text2Style: {
        fontFamily: 'Sen-Regular',
        fontSize: 13
      },
      type: 'success',
      text1: '¡Producto agregado!',
      text2: `${item.name} se agregó al carrito`,
      position: 'top',
      visibilityTime: 3000,
    });
  };

  const handleRestartCart = () => {
    clearCart();
    setConflictModal(false);
    proceedAddToCart(pendingItem);
    setPendingItem(null);
  };

  const handleCancelAdd = () => {
    setConflictModal(false);
    setPendingItem(null);
  };

  const updateQuantity = (id, presentationId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity, presentationId } });
  };

  const removeFromCart = (id, presentationId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { id, presentationId } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const hasRole = (role) => {
    const found = session?.roles?.find(r => r.name == role)
    return !!found
  }

  const verifySession = async () => {
    const result = await authRest.verify();
    if (result) {
      setIsAuthenticated(true)
      return true
    }
    setIsAuthenticated(false);
    router.replace('/(auth)/login')
    return false
  }

  const loadIndex = async () => {
    setIsLoading(true)
    if (!verifySession()) return
    if (appMode == 'Client') {
      const [categoriesData, restaurantsData, paymentMethodsData, statusesData, lastPendingOrderData] = await Promise.all([
        categoriesRest.all(),
        restaurantsRest.all(),
        paymentMethodsRest.all(),
        statusesRest.all(),
        ordersRest.last(),
      ]);
      setCategories(categoriesData ?? []);
      setRestaurants(restaurantsData ?? []);
      setPaymentMethods(paymentMethodsData ?? [])
      setStatuses(statusesData ?? []);
      setLastPendingOrder(lastPendingOrderData ?? null)
    }
    if (appMode == 'Delivery') {
      const [statusesData, availableOrdersData, lastPendingOrderData] = await Promise.all([
        statusesRest.all(),
        ordersRest.available(),
        ordersRest.last('delivery')
      ]);
      setStatuses(statusesData ?? []);
      setAvailableOrders(availableOrdersData ?? [])
      setLastPendingOrder(lastPendingOrderData ?? null)
    }
    setIsLoading(false);

    const currentSession = await SecureStore.getItemAsync('session');
    setSession(JSON.parse(currentSession))

    // Load cart from AsyncStorage
    const storedCart = await AsyncStorage.getItem('cart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        // Replace cart instead of adding
        dispatch({ type: 'CLEAR_CART' });
        parsedCart.forEach(item => {
          dispatch({ type: 'ADD_TO_CART', payload: item });
        });
      } catch (e) {
        // ignore parse errors
      }
    }
  }
  // Persist cart to AsyncStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoading]);

  // Auto-select cheapest presentation when selectedItem changes
  useEffect(() => {
    if (selectedItem?.presentations?.length) {
      const cheapest = selectedItem.presentations.reduce(
        (min, p) => (Number(p.price) < Number(min.price) ? p : min),
        selectedItem.presentations[0]
      );
      setSelectedItem(prev => ({ ...prev, selectedPresentation: cheapest, quantity: 1 }));
    }
  }, [selectedItem?.id]);

  // Socket connection and event handling moved here
  useEffect(() => {
    if (!isAuthenticated || !session?.id) return

    // Avoid multiple connections
    if (!socketRef.current) {
      socketRef.current = io(`${EVENTS_URL}/${APP_CORRELATIVE}`, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity
      })

      const socket = socketRef.current

      socket.on('connect', () => {
        console.log('🟢 Conectado a', socket.io.uri)
        socket.emit('register_filters', {
          environment: APP_ENV,
          user_id: session.id,
          mode: appMode === 'Delivery' ? 'delivery' : 'client'
        })
      })

      socket.on('filters_registered', ({ filters }) => {
        console.log('✅ Filtros actualizados', filters)
      })

      socket.on('disconnect', () => {
        console.log('🔴 Desconectado de', socket.io.uri)
      })

      socket.on('error', (err) => console.error('❌ Error socket:', err))

      socket.on('order.created', (order) => setLastPendingOrder(order))
      socket.on('order.updated', (order) => setLastPendingOrder(order))
    }

    return () => {
      if (socketRef.current) {
        console.log('🔴 Cerrando conexión...')
        socketRef.current.disconnect()
        socketRef.current = null
        setLastPendingOrder(null)
      }
    }
  }, [isAuthenticated, session?.id, appMode])

  useEffect(() => {
    if (!isAuthenticated || appMode == null) return
    loadIndex()
  }, [isAuthenticated, appMode]);

  useEffect(() => {
    if (!appMode) return
    console.log('Contect effect:', appMode)
    SecureStore.setItemAsync('app-mode', appMode)
  }, [appMode])

  useEffect(() => {
    SecureStore.getItemAsync('app-mode')
      .then(mode => {
        setAppMode(mode)
      })
  }, [])

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isLoading, setIsLoading,
    categories,
    restaurants,
    paymentMethods,
    loadIndex,
    session, setSession,
    setSelectedItem,
    lastPendingOrder,
    hasRole,
    appMode, setAppMode,
    setIsAuthenticated,
    availableOrders
  };

  return (
    <CartContext.Provider value={value}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
            <Image
              source={isotipo}
              style={{ width: 80, height: 80, marginBottom: 16 }}
              resizeMode="contain"
            />
            <ActivityIndicator size="large" color="#FF4D4F" />
            <AppText weight='Bold' style={{ marginTop: 12, fontSize: 20, color: '#333' }}>{APP_NAME}</AppText>
            <AppText style={{ marginTop: 8, fontSize: 14, color: '#666' }}>Cargando datos del sistema...</AppText>
          </View>
        ) : (<>
          {
            (isAuthenticated && lastPendingOrder) ?
              <>
                {
                  appMode == 'Delivery'
                    ? <DeliveringOrder {...lastPendingOrder} statuses={statuses} />
                    : <PendingOrder {...lastPendingOrder} statuses={statuses} />
                }
              </>
              : children
          }
        </>
        )}
        {/* Conflict Modal */}
        <Modal
          transparent
          animationType="fade"
          visible={conflictModal}
          onRequestClose={handleCancelAdd}
          navigationBarTranslucent={true}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 16, paddingVertical: 24, paddingHorizontal: 20, width: '100%', maxWidth: 320, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8 }}>
              <AppText weight="Bold" style={{ fontSize: 22, color: '#333', marginBottom: 12, textAlign: 'center' }}>¡Ups! 🍽️</AppText>
              <AppText style={{ fontSize: 15, color: '#555', textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
                Parece que quieres mezclar sabores de dos restaurantes distintos.
                Por ahora solo puedes ordenar de uno a la vez.
              </AppText>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity style={{ flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 6, backgroundColor: '#f5f5f5' }} onPress={handleCancelAdd}>
                  <AppText weight="Bold" style={{ color: '#666', fontSize: 15 }}>Cancelar</AppText>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 6, backgroundColor: '#FF4D4F' }} onPress={handleRestartCart}>
                  <AppText weight="Bold" style={{ color: '#fff', fontSize: 15 }}>Reiniciar carrito</AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <ItemDetail selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
        <Toast />
      </SafeAreaView>
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
