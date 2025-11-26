import { TouchableOpacity } from "react-native"
import AppText from "../app-text"

const OrderButton = ({ children, outline = false, onPress }) => {
    return <TouchableOpacity
        style={{
            flex: 1,
            backgroundColor: outline ? '#ffffff' : '#FF4D4F',
            borderRadius: 8,
            paddingVertical: 12,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#FF4D4F',
        }}
        onPress={onPress}
    >
        <AppText weight='Bold' style={{ fontSize: 12, color: outline ? '#FF4D4F' : '#ffffff' }}>{children}</AppText>
    </TouchableOpacity>
}

export default OrderButton