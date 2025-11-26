import { Image, TouchableOpacity, View } from "react-native";
import AppText from "../app-text";
import { STORAGE_URL } from "../../constants/settings";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const RestaurantCompact = ({ restaurant }) => {
    const logoUrl = `${STORAGE_URL}/restaurant/${restaurant.logo}`;

    return <TouchableOpacity
        style={{ width: '100%' }}
        onPress={() => router.push(`/restaurant/${restaurant.id}`)}
    >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Image
                source={{ uri: logoUrl }}
                style={{
                    width: 64,
                    height: 64,
                    borderRadius: 12,
                    backgroundColor: '#98A8B8'
                }}
            />
            <View style={{ flex: 1 }}>
                <AppText style={{ fontSize: 16, color: '#181C2E', marginBottom: 6 }}>{restaurant.name}</AppText>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="star-outline" size={14} color="#FF4D4F" />
                    <AppText style={{ fontSize: 16, color: '#181C2E' }}>4.0</AppText>
                    <Ionicons name="ellipse" size={6} color="#6B6E82" style={{ alignSelf: 'center', marginHorizontal: 6 }} />
                    <AppText style={{ fontSize: 14, color: '#A0A5BA' }}>{restaurant.items_count} platos</AppText>
                </View>
            </View>
        </View>
    </TouchableOpacity>
}

export default RestaurantCompact;