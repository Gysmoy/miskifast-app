import { Image, TouchableOpacity, View } from "react-native";
import { APP_URL } from "../../constants/settings";
import { Ionicons } from "@expo/vector-icons";
import Number2Currency from "../../scripts/number2Currency";
import { useCart } from '@/src/context/CartContext';
import AppText from "@/components/app-text"

const ItemList = ({ item }) => {
    const { setSelectedItem } = useCart()

    return (
        <View style={{ flexDirection: 'row', marginBottom: 12, backgroundColor: '#fff', borderRadius: 12, elevation: 2, overflow: 'hidden' }}>
            <Image source={{ uri: `${APP_URL}/storage/images/item/${item.image}` }} style={{ width: 110, aspectRatio: 1, backgroundColor: '#98A8B8' }} />
            <View style={{ flex: 1, padding: 12 }}>
                <AppText weight='Bold' style={{ fontSize: 15, color: '#333' }}>{item.name}</AppText>
                <AppText style={{ fontSize: 13, color: '#666', marginTop: 4, height: 32 }} numberOfLines={2}>{item.description}</AppText>
                <AppText weight='ExtraBold' style={{ fontSize: 16, color: '#E63946', marginTop: 4 }}>S/ {Number2Currency(item.price)}</AppText>
            </View>
            <TouchableOpacity
                onPress={() => setSelectedItem(item)}
                activeOpacity={0.8}
                style={{ backgroundColor: '#E63946', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginRight: 12 }}
            >
                <Ionicons name="add" size={18} color="#fff" />
            </TouchableOpacity>
        </View>
    )
}

export default ItemList