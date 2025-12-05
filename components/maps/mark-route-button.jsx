import { Ionicons } from "@expo/vector-icons"
import { TouchableOpacity } from "react-native"
import AppText from "../app-text"

const MarkRouteButton = ({ icon = "analytics-outline", onPress, disabled, children }) => {
    return <TouchableOpacity style={{
        backgroundColor: '#FF4D4F',
        position: 'absolute',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        top: -54,
        left: '50%',
        transform: [{ translateX: '-50%' }],
        opacity: disabled ? 0.5 : 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6
    }}
        onPress={onPress}
        disabled={disabled}>
        <Ionicons name={icon} size={16} color='#ffffff' />
        <AppText style={{ fontSize: 14, color: '#ffffff', textTransform: 'uppercase' }}>{children}</AppText>
    </TouchableOpacity>
}

export default MarkRouteButton