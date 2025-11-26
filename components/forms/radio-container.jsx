import { TouchableOpacity } from "react-native"
import { View } from "react-native"
import AppText from "@/components/app-text"

const RadioContainer = ({ label, value, setValue, loading = false, disabled = false, options = [], uppercase = false }) => {
    return <View style={{ flex: 1, marginRight: 8 }}>
        <AppText weight='SemiBold' style={{
            fontSize: 14,
            color: '#32343E',
            marginBottom: 8,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
        }}>{label}</AppText>

        <View style={{ flexDirection: 'row', gap: 12 }}>
            {
                options.map((option, index) => {
                    return <TouchableOpacity
                        key={index}
                        onPress={() => setValue(option.value)}
                        style={{
                            flex: 1,
                            paddingVertical: 12,
                            borderRadius: 24,
                            backgroundColor: loading || disabled
                                ? (value === option.value ? '#FF7173' : '#E0E5EA')
                                : (value === option.value ? '#FF4D4F' : '#F0F5FA'),
                            alignItems: 'center',
                        }}
                        disabled={loading || disabled}
                    >
                        <AppText weight={value === option.value ? 'Bold' : 'Regular'} style={{
                            color: value === option.value ? '#fff' : '#32343E',
                            textTransform: uppercase ? 'uppercase' : undefined
                        }}>
                            {option.label}
                        </AppText>
                    </TouchableOpacity>
                })
            }
        </View>
    </View>
}

export default RadioContainer