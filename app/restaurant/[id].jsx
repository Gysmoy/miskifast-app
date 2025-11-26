import React, { useEffect, useState } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/src/context/CartContext';
import { APP_URL } from '../../constants/settings';
import ItemsRest from '../../src/data/ItemsRest';
import AppText from "@/components/app-text"
import ItemsGrid from '../../components/items/items-grid';

const itemsRest = new ItemsRest()

export default function RestaurantScreen() {
    const { id } = useLocalSearchParams();
    const { restaurants } = useCart();
    const restaurant = restaurants.find(r => r.id == id);

    const categories = restaurant?.categories || [];

    const [selectedCategory, setSelectedCategory] = useState(categories[0] ?? null);

    const [items, setItems] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [logoVisible, setLogoVisible] = useState(true)

    if (!restaurant) {
        return (
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <AppText style={{ textAlign: 'center', color: '#E63946', marginTop: 40 }}>Restaurante no encontrado</AppText>
            </View>
        );
    }

    const imageUrl = `${APP_URL}/storage/images/restaurant/${restaurant.banner}`;
    const logoUrl = `${APP_URL}/storage/images/restaurant/${restaurant.logo}`;

    const getItems = async () => {
        setIsLoading(true)
        const result = await itemsRest.byRestaurantAndCategory(restaurant.id, selectedCategory.id)
        setItems(result)
        setIsLoading(false)
    }

    useEffect(() => {
        getItems()
    }, [selectedCategory])

    return <View style={{ flex: 1, backgroundColor: '#fff' }} >
        <ScrollView style={{ backgroundColor: '#fff' }}>
            <View style={{ position: 'relative' }}>
                <Image source={{ uri: imageUrl }} style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: '#98A8B8' }} />
                <Image
                    source={{ uri: logoUrl }}
                    onError={() => setLogoVisible(false)}
                    style={{
                        position: 'absolute',
                        bottom: 24, left: 24, width: 64, height: 64,
                        borderRadius: 12,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.5,
                        shadowRadius: 12,
                        elevation: 12,
                        backgroundColor: '#818F9C',
                        opacity: logoVisible ? 1 : 0
                    }}
                />
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ position: 'absolute', top: 24, left: 24, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 8 }}
                >
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
            <View style={{ paddingHorizontal: 24, paddingTop: 24, marginBottom: 12 }}>
                <AppText weight='Bold' style={{ fontSize: 20, color: '#181C2E', marginBottom: 12 }}>{restaurant.name}</AppText>
                <AppText style={{ fontSize: 14, color: '#A0A5BA', }}>{restaurant.description}</AppText>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{
                    paddingVertical: 12,
                    gap: 12,
                }}
                contentContainerStyle={{
                    paddingHorizontal: 24,
                }}
            >
                {restaurant.categories.map((category) => {
                    return <TouchableOpacity
                        key={category.id}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderRadius: 30,
                            marginRight: 8,
                            gap: 8,
                            borderWidth: 2,
                            borderColor: selectedCategory.id === category.id ? '#FF4D4F' : '#EDEDED',
                            backgroundColor: selectedCategory.id === category.id ? '#FF4D4F' : '#fff',
                        }}
                        onPress={() => setSelectedCategory(category)}
                    >
                        <AppText
                            style={{
                                fontSize: 16,
                                color: selectedCategory.id === category.id ? '#fff' : '#666',
                            }}
                        >
                            {category?.name}
                        </AppText>
                    </TouchableOpacity>
                })}
            </ScrollView>

            {/* Platos Recomendados */}
            <View style={{ marginTop: 12 }}>
                <View style={{ marginHorizontal: 24, marginBottom: 24 }}>
                    <AppText weight='Bold' style={{ fontSize: 20, color: '#333' }}>
                        {selectedCategory?.name}{' '}
                        {selectedCategory && <>({items?.length || 0})</>}
                    </AppText>
                </View>
                <ItemsGrid loading={isLoading} showDescription items={items} skeletons={1} />
            </View>
        </ScrollView>
    </View>;
}
