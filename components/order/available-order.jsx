import { Image, TouchableOpacity, View } from "react-native";
import { STORAGE_URL } from "../../constants/settings";
import AppText from "../app-text";
import Number2Currency from "../../scripts/number2Currency";

const AvailableOrder = ({ id, restaurant, client, total_amount, loading, onAccept = () => { }, onCancel = () => { } }) => {
    const logoUrl = `${STORAGE_URL}/restaurant/${restaurant.logo}`;
    return <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <Image
            source={{ uri: logoUrl }}
            style={{
                width: 96, height: 96,
                borderRadius: 12,
                backgroundColor: '#818F9C',
            }}
        />
        <View style={{ flex: 1 }}>
            <View style={{ marginBottom: 12 }}>
                <AppText weight='Bold' style={{ fontSize: 14, marginBottom: 6 }}>{restaurant.name}</AppText>
                <AppText style={{ fontSize: 14, color: '#9C9BA6' }}>Cliente: {client.name} {client.lastname}</AppText>
            </View>
            <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
                <AppText style={{ fontSize: 18 }}>S/ {Number2Currency(total_amount)}</AppText>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#FF4D4F',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 8,
                            opacity: loading ? 0.5 : 1
                        }}
                        disabled={loading}
                        onPress={() => onAccept(id)}>
                        <AppText style={{ fontSize: 14, color: '#ffffff' }}>Aceptar</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#ffffff',
                            borderWidth: 1,
                            borderColor: '#FF4D4F',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 8,
                            opacity: loading ? 0.5 : 1
                        }}
                        disabled={loading}
                        onPress={() => onCancel(id)} >
                        <AppText style={{ fontSize: 14, color: '#FF4D4F' }}>Rechazar</AppText>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </View>
}

export default AvailableOrder