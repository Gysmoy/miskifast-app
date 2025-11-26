import { TouchableOpacity } from "react-native"
import { useCart } from '@/src/context/CartContext';
import { Ionicons } from "@expo/vector-icons";

const SwitchMode = ({ disabled }) => {
    const { appMode, setAppMode } = useCart()

    return <TouchableOpacity style={{ 
        backgroundColor: '#ffffff', 
        borderRadius: 24, 
        flexDirection: 'row', 
        borderWidth: 2, 
        borderColor: '#181C2E', 
        overflow: 'hidden',
        opacity: disabled ? 0.5 : 1
    }} onPress={() => setAppMode(appMode !== 'Delivery' ? 'Delivery' : 'Client')}
        disabled={disabled}>
        <Ionicons name="person" size={20} color={appMode !== 'Delivery' ? "#ffffff" : '#181C2E'} style={{
            paddingVertical: 8,
            paddingHorizontal: 10,
            backgroundColor: appMode !== 'Delivery' ? '#181C2E' : '#ffffff',
            borderTopRightRadius: 16, borderBottomRightRadius: 16,
            transition: 'colors'
        }} />
        <Ionicons name="bicycle" size={20} color={appMode == 'Delivery' ? "#ffffff" : '#181C2E'} style={{
            paddingVertical: 8,
            paddingHorizontal: 10,
            backgroundColor: appMode == 'Delivery' ? '#181C2E' : '#ffffff',
            borderTopLeftRadius: 16, borderBottomLeftRadius: 16,
            transition: 'colors'
        }} />
    </TouchableOpacity>
}
export default SwitchMode