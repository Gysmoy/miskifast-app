import { Ionicons } from "@expo/vector-icons"
import { View } from "react-native"
import { TouchableOpacity } from "react-native"
import AppText from "../app-text"

const MenuItem = ({ onPress, icon, color, children }) => {
    return <TouchableOpacity
        style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingVertical: 12,
            gap: 18
        }}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
            <Ionicons name={icon} size={20} color={color} />
            <AppText style={{ fontSize: 16, color: '#32343E' }}>
                {children}
            </AppText>
        </View>
        <Ionicons name="chevron-forward" size={15} color="#747783" />
    </TouchableOpacity>
}

export default MenuItem