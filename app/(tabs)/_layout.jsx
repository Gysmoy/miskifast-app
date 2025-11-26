import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/src/context/CartContext';

export default function TabLayout() {
  const { lastPendingOrder, appMode } = useCart();

  const isClient = appMode === 'Client';
  const isDelivery = appMode === 'Delivery';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF4D4F',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}>

      {/* HOME — siempre visible */}
      <Tabs.Screen
        name="index"
        options={{
          title: '▬',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* CLIENTE */}
      <Tabs.Screen
        name="orders"
        options={{
          href: isClient ? "/orders" : null,   // OCULTA TOTALMENTE
          title: '▬',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="receipt" size={size} color={color} />
          ),
          tabBarBadge: isClient && lastPendingOrder ? true : null,
          tabBarBadgeStyle: {
            minWidth: 12,
            maxWidth: 12,
            height: 12,
            width: 12,
            borderRadius: 6,
            backgroundColor: '#FF4D4F',
          },
        }}
      />

      <Tabs.Screen
        name="fav"
        options={{
          href: isClient ? "/fav" : null,
          title: '▬',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          href: isClient ? "/profile" : null,
          title: '▬',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

      {/* DELIVERY */}
      <Tabs.Screen
        name="history"
        options={{
          href: isDelivery ? "/history" : null,
          title: '▬',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}
