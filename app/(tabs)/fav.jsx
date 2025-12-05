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
import FavoritesRest from '../../src/data/favorites-rest';
import AppText from '../../components/app-text';
import Number2Currency from '../../scripts/number2Currency';
import ItemsGrid from '../../components/items/items-grid';

const favoritesRest = new FavoritesRest()

export default function FavoritesScreen() {
    const [favorites, setFavorites] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchFavorites = async () => {
        const result = await favoritesRest.paginate()
        setFavorites(result ?? [])
        setHasMore(true)
    }

    const loadNewers = async () => {
        if (!favorites.length) return;
        const newestCreatedAt = favorites[0].created_at;
        setRefreshing(true);
        const result = await favoritesRest.paginate({
            filter: [
                'created_at', '>', newestCreatedAt
            ]
        });
        if (result && result.length) {
            setFavorites(prev => {
                const existingIds = new Set(prev.map(o => o.id));
                const newOrders = result.filter(o => !existingIds.has(o.id));
                return [...newOrders, ...prev];
            });
        }
        setRefreshing(false);
    };

    const loadOlders = async () => {
        console.log('Haciendo petición para cargar más pedidos antiguos')
        if (!hasMore || loadingOlder || !favorites.length) return;
        const oldestCreatedAt = favorites[favorites.length - 1].created_at;
        setLoadingOlder(true);
        console.log(oldestCreatedAt)
        const result = await favoritesRest.paginate({
            filter: [
                'created_at', '<', oldestCreatedAt
            ]
        });
        if (result && result.length) {
            setFavorites(prev => {
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
        fetchFavorites()
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
            contentContainerStyle={{ paddingBottom: 24, gap: 24 }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={loadNewers} />
            }
            onScroll={handleScroll}
            scrollEventThrottle={400}
        >
            <ItemsGrid loading={refreshing} items={favorites.map(favorite => favorite.item)} skeletons={2} showRestaurant/>
            {loadingOlder && (
                <ActivityIndicator size="small" color="#181C2E" style={{ marginTop: 12 }} />
            )}
        </ScrollView>
    </View>
}