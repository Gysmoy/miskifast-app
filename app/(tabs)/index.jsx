import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { useCart } from '@/src/context/CartContext';
import { Ionicons } from '@expo/vector-icons';
import TitleContainer from '../../components/title-container';
import RestaurantList from '../../components/restaurants/restaurant-list';
import AppText from "@/components/app-text"
import SimpleCategory from '../../components/categories/simple-category';
import SwitchMode from '../../components/ui/switch-mode';
import AvailableOrder from '../../components/order/available-order';
import OrdersRest from '@/src/data/OrdersRest'

const ordersRest = new OrdersRest()

export default function HomeScreen() {
    const { categories, restaurants, loadIndex, availableOrders, getTotalItems, session, hasRole, appMode } = useCart();
    const totalItems = getTotalItems();
    const [refreshing, setRefreshing] = useState(false);
    const flatListRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [taking, setTaking] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadIndex()
        setRefreshing(false);
    };

    const onTakeOrder = async (orderId) => {
        setTaking(true);
        const result = await ordersRest.deliver(orderId);
        setTaking(false)
        if (!result) {
            onRefresh()
            return
        }
    }

    useEffect(() => {
        if (!categories || !categories.length || appMode == 'Delivery') return;
        const interval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % categories.length;
            setCurrentIndex(nextIndex);
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        }, 2000);
        return () => clearInterval(interval);
    }, [currentIndex, categories, appMode]);

    return (<>
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ padding: 24, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{}}>
                    <AppText weight='Bold' style={{ fontSize: 12, color: '#FF4D4F', textTransform: 'uppercase' }}>Entregar en</AppText>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <AppText style={{ fontSize: 14, marginRight: 4, color: '#676767' }}>Ub. San José T-13</AppText>
                        <Ionicons name="chevron-down" size={16} color="#666" />
                    </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    {
                        hasRole('Delivery') && <SwitchMode disabled={taking} />
                    }
                    {
                        appMode !== 'Delivery' &&
                        <TouchableOpacity style={{ backgroundColor: '#181C2E', padding: 8, borderRadius: 24 }} onPress={() => router.push('/cart')}>
                            <Ionicons name="cart-outline" size={24} color="#fff" />
                            <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: '#FF4D4F', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, minWidth: 20, alignItems: 'center', justifyContent: 'center' }}>
                                <AppText weight='Bold' style={{ color: '#fff', fontSize: 12, lineHeight: 12 }}>{totalItems}</AppText>
                            </View>
                        </TouchableOpacity>
                    }
                </View>
            </View>

            <ScrollView
                className="p-4"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#FF4D4F']}
                        tintColor="#FF4D4F"
                    />
                }
            >
                {
                    appMode == 'Delivery'
                        ? <>
                            <TitleContainer title={`${availableOrders.length} Pedidos disponibles`} style={{ paddingHorizontal: 24, marginBottom: 24 }} />
                            <View style={{ flex: 1, marginHorizontal: 24, gap: 12 }}>
                                {availableOrders.map((order, idx) => <AvailableOrder key={idx} {...order} onAccept={onTakeOrder} loading={taking} />)}
                            </View>
                        </>
                        : <>
                            <AppText style={{
                                fontSize: 16,
                                color: '#1E1D1D',
                                paddingHorizontal: 24,
                                marginBottom: 24
                            }}>
                                Hey {session?.name},
                                <AppText weight='Bold'> Buenas tardes!</AppText>
                            </AppText>
                            <TouchableOpacity
                                style={{ flexDirection: 'row', paddingHorizontal: 24, marginBottom: 24, alignItems: 'center', gap: 6 }}
                                onPress={() => router.push('/search')}
                            >
                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6F6F6', borderRadius: 8, padding: 18, gap: 12 }}>
                                    <Ionicons name="search" size={20} color="#999" />
                                    <AppText style={{ color: '#999', fontSize: 14, flex: 1 }}>
                                        Buscar platos, restaurantes
                                    </AppText>
                                </View>
                            </TouchableOpacity>
                            <TitleContainer title="Categorías" style={{ paddingHorizontal: 24 }} />
                            <FlatList
                                ref={flatListRef}
                                data={categories}
                                renderItem={({ item, index }) => {
                                    return <SimpleCategory key={index} {...item} />
                                }}
                                keyExtractor={(item) => item.id.toString()}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{
                                    paddingHorizontal: 24,
                                    paddingVertical: 24,
                                }}
                                onMomentumScrollEnd={(e) => {
                                    const index = Math.round(e.nativeEvent.contentOffset.x / (e.nativeEvent.layoutMeasurement.width * 0.5));
                                    setCurrentIndex(index);
                                }}
                                getItemLayout={(data, index) => ({
                                    length: 180, // aprox ancho del item
                                    offset: 180 * index,
                                    index,
                                })}
                            />

                            <TitleContainer title="Restaurantes" style={{ paddingHorizontal: 24, marginBottom: 24 }} />


                            <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 24 }}>
                                    {restaurants.map((restaurant, index) => <RestaurantList key={index} restaurant={restaurant} />)}
                                </View>
                            </View>
                        </>
                }
            </ScrollView>
        </View>
    </>);
}