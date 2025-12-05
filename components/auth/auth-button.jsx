import { ActivityIndicator, Text, TouchableOpacity } from "react-native"
import AppText from "@/components/app-text"

const AuthButton = ({ text, loading, disabled, loadingText, onPress }) => {
    return <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={{
            backgroundColor: loading || disabled ? '#ff7173' : '#FF4D4F',
            height: 56,
            paddingHorizontal: 24,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 24,
            flexDirection: 'row',
            gap: 8
        }}>
        {loading && <ActivityIndicator size="small" color="#fff" />}
        <AppText weight='Bold' style={{
            color: '#fff',
            fontSize: 16,
            textTransform: 'uppercase',
        }}>{loading ? loadingText : text}</AppText>
    </TouchableOpacity>
}

export default AuthButton