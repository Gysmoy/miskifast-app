import React, { useEffect, useState } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Image,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { STORAGE_URL } from '../../constants/settings';
import { Ionicons } from '@expo/vector-icons';
import OrdersRest from '../../src/data/OrdersRest';
import AppText from '../../components/app-text';
import Number2Currency from '../../scripts/number2Currency';
import OrderButton from '../../components/order/order-button';

const ordersRest = new OrdersRest()

export default function OrdersScreen() {
    const [orders, setOrders] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchOrders = async () => {
        const result = await ordersRest.paginate()
        setOrders(result ?? [])
        setHasMore(true)
    }

    const loadNewers = async () => {
        if (!orders.length) return;
        const newestCreatedAt = orders[0].created_at;
        setRefreshing(true);
        const result = await ordersRest.paginate({
            filter: [
                'created_at', '>', newestCreatedAt
            ]
        });
        if (result && result.length) {
            setOrders(prev => {
                const existingIds = new Set(prev.map(o => o.id));
                const newOrders = result.filter(o => !existingIds.has(o.id));
                return [...newOrders, ...prev];
            });
        }
        setRefreshing(false);
    };

    const loadOlders = async () => {
        console.log('Haciendo petición para cargar más pedidos antiguos')
        if (!hasMore || loadingOlder || !orders.length) return;
        const oldestCreatedAt = orders[orders.length - 1].created_at;
        setLoadingOlder(true);
        console.log(oldestCreatedAt)
        const result = await ordersRest.paginate({
            filter: [
                'created_at', '<', oldestCreatedAt
            ]
        });
        if (result && result.length) {
            setOrders(prev => {
                const existingIds = new Set(prev.map(o => o.id));
                const newOrders = result.filter(o => !existingIds.has(o.id));
                return [...prev, ...newOrders];
            });
        } else {
            setHasMore(false);
        }
        setLoadingOlder(false);
    };

    const handleScroll = ({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
        if (isCloseToBottom) {
            loadOlders();
        }
    };

    useEffect(() => {
        fetchOrders()
    }, [])

    return <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 24, gap: 12 }}>
            <TouchableOpacity
                onPress={() => router.back()}
                style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, padding: 8 }}
            >
                <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <AppText style={{ fontSize: 17, color: '#181C2E' }}>Mis favoritos</AppText>
        </View>
        <ScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, gap: 24 }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={loadNewers} />
            }
            onScroll={handleScroll}
            scrollEventThrottle={400}
        >
            {orders.map((order) => {
                const completed = order.delivery_status_id === 'f7b3f073-c8bf-49c9-ba6d-fcdfe82395dc';
                return (
                    <View key={order.id} style={{ gap: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            {
                                completed ? <>
                                    <AppText weight='Bold' style={{ fontSize: 14, color: order.delivery_status?.color ?? undefined, textTransform: 'uppercase' }}>{order.delivery_status?.name}</AppText>
                                    <Image source={{ uri: `${STORAGE_URL}/status/${order.delivery_status?.image}` }} style={{ width: 16, height: 16, borderRadius: 2, tintColor: '#181C2E', }} />
                                </>
                                    : <>
                                        <AppText weight='Bold' style={{ fontSize: 14, color: order.status?.color ?? undefined, textTransform: 'uppercase' }}>{order.status?.name}</AppText>
                                        <Image source={{ uri: `${STORAGE_URL}/status/${order.status?.image}` }} style={{ width: 16, height: 16, borderRadius: 2, tintColor: '#181C2E', }} />
                                    </>
                            }
                        </View>
                        <View style={{ height: 2, borderRadius: 1, backgroundColor: '#EEF2F6' }} />
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <Image
                                source={{ uri: `${STORAGE_URL}/restaurant/${order.restaurant?.logo}` }}
                                style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: '#98A8B8' }}
                            />
                            <View style={{ flex: 1, justifyContent: 'center', gap: 6 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <AppText weight='SemiBold' style={{ fontSize: 14, color: '#181C2E' }}>
                                        {order.restaurant?.name}
                                    </AppText>
                                    <AppText style={{ fontSize: 14, color: '#6B6E82' }}>
                                        #{order.code}
                                    </AppText>
                                </View>
                                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 4 }}>
                                    <AppText weight='Bold' style={{ fontSize: 14, color: '#181C2E' }}>
                                        S/ {Number2Currency(order.total_amount)}
                                    </AppText>
                                    <Ionicons name="remove" size={18} color="#6B6E82" style={{ transform: [{ rotate: '90deg' }] }} />
                                    <AppText style={{ fontSize: 12, color: '#6B6E82', textTransform: 'uppercase' }}>
                                        {new Date(order.created_at).toLocaleString('es-ES', {
                                            day: '2-digit',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </AppText>
                                    <Ionicons name="ellipse" size={6} color="#6B6E82" style={{ alignSelf: 'center' }} />
                                    <AppText style={{ fontSize: 12, color: '#6B6E82' }}>
                                        {order.details_count} items
                                    </AppText>
                                </View>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 24 }}>
                            {completed ? (
                                <>
                                    <OrderButton outline>Calificar</OrderButton>
                                    <OrderButton>Re-Ordenar</OrderButton>

                                </>
                            ) : (
                                <>
                                    <OrderButton onPress={() => { }}>Seguir pedido</OrderButton>
                                    <OrderButton outline onPress={() => { }}>Cancelar</OrderButton>
                                </>
                            )}
                        </View>
                    </View>
                );
            })}
            {loadingOlder && (
                <ActivityIndicator size="small" color="#181C2E" style={{ marginTop: 12 }} />
            )}
        </ScrollView>
    </View>
}