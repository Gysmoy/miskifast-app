import { useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { STORAGE_URL } from "../../constants/settings";
import { router } from "expo-router";
import AppText from "@/components/app-text"

const RestaurantList = ({ restaurant, showCategories = true }) => {
    const [logoVisible, setLogoVisible] = useState(true)

    const bannerUrl = `${STORAGE_URL}/restaurant/${restaurant.banner}`;
    const logoUrl = `${STORAGE_URL}/restaurant/${restaurant.logo}`;
    return <TouchableOpacity
        style={{ width: '100%' }}
        onPress={() => router.push(`/restaurant/${restaurant.id}`)}
    >
        <View style={{ position: 'relative', marginBottom: 12 }}>
            <Image source={{ uri: bannerUrl }} style={{ width: '100%', aspectRatio: 327 / 115, borderRadius: 12, backgroundColor: '#98A8B8' }} />
            <Image
                source={{ uri: logoUrl }}
                onError={() => setLogoVisible(false)}
                style={{
                    position: 'absolute',
                    bottom: 12, left: 12, width: 64, height: 64,
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
        </View>
        <AppText weight="SemiBold" style={{ fontSize: 20, marginBottom: 12 }}>{restaurant.name}</AppText>
        {
            showCategories &&
            <AppText numberOfLines={1} ellipsizeMode="tail" style={{ fontSize: 14, color: '#181C2E', marginBottom: 12 }}>
                {restaurant.categories.map(cat => cat.name).join(' - ')}
            </AppText>
        }
        <AppText style={{ fontSize: 14, color: '#A0A5BA' }} numberOfLines={2}>{restaurant.description}</AppText>
    </TouchableOpacity>
}

export default RestaurantList