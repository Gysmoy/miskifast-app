import { Image, TouchableOpacity, View } from "react-native"
import { useCart } from '@/src/context/CartContext';
import { STORAGE_URL } from "../../constants/settings"
import Number2Currency from "../../scripts/number2Currency"
import AppText from "../app-text"
import { Ionicons } from "@expo/vector-icons"

const CartItem = ({ id, presentationId, image, name, price, quantity, presentation, observation }) => {
    const { updateQuantity, removeFromCart } = useCart()

    const imageUrl = `${STORAGE_URL}/item/${image}`
    return <View key={`${id}-${presentationId}`} style={{
        flexDirection: 'row',
        alignItems: 'center',
    }}>
        <Image source={{ uri: imageUrl }} style={{ width: '30%', aspectRatio: 1, borderRadius: 24, marginRight: 16, backgroundColor: 'rgba(255, 255, 255, .1)' }} />
        <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <AppText style={{ fontSize: 18, color: '#fff', flexShrink: 1, maxWidth: '80%', textTransform: 'uppercase' }} numberOfLines={2}>{name}</AppText>
                <TouchableOpacity
                    style={{
                        padding: 4,
                        borderRadius: 24,
                        borderWidth: 1,
                        backgroundColor: '#E04444'
                    }}
                    onPress={() => removeFromCart(id, presentationId)}
                >
                    <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
            <AppText weight='ExtraBold' style={{ fontSize: 20, color: '#fff' }}>S/ {Number2Currency(price)}</AppText>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                <AppText style={{ fontSize: 18, color: '#fff' }}>{presentation}</AppText>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        style={{
                            width: 30,
                            height: 30,
                            borderRadius: 15,
                            backgroundColor: 'rgba(255,255,255,.1)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            opacity: quantity <= 1 ? 0.4 : 1
                        }}
                        disabled={quantity <= 1}
                        onPress={() => updateQuantity(id, presentationId, quantity - 1)}
                    >
                        <Ionicons name="remove" size={16} color="#fff" />
                    </TouchableOpacity>
                    <AppText weight='Bold' style={{ fontSize: 16, marginHorizontal: 12, color: '#fff' }}>{quantity}</AppText>
                    <TouchableOpacity
                        style={{
                            width: 30,
                            height: 30,
                            borderRadius: 15,
                            backgroundColor: 'rgba(255,255,255,.1)',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                        onPress={() => updateQuantity(id, presentationId, quantity + 1)}
                    >
                        <Ionicons name="add" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
            {/* Observation indicator */}
            {observation ? (
                <View style={{ marginTop: 6 }}>
                    <AppText style={{ fontSize: 14, color: '#FFD700' }}>
                        <Ionicons name="information-circle" size={14} color="#FFD700" /> {observation}
                    </AppText>
                </View>
            ) : null}
        </View>
    </View>
}

export default CartItem