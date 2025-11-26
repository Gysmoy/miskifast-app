import isHuawei from "@/hooks/is-huawei"
import { Ionicons } from "@expo/vector-icons"
import { View } from "react-native"
import { Marker } from "react-native-maps"
import { HMSMarker } from '@hmscore/react-native-hms-map';

const AppMarker = isHuawei() ? HMSMarker : Marker

const CustomMarker = ({ title, icon, color, latitude, longitude }) => {
    return <AppMarker
        coordinate={{
            latitude: Number(latitude),
            longitude: Number(longitude)
        }}
        title={title}
        anchor={{ x: 0.35, y: .8 }}
    >
        <View style={{
            alignItems: "center",
            position: 'relative'
        }}>
            {/* Icono circular */}
            <View style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                backgroundColor: "#fff",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 2,
                borderColor: color,
            }}>
                <Ionicons name={icon} size={22} color={color} />
            </View>
            <View style={{
                position: 'absolute',
                width: 8,
                height: 8,
                backgroundColor: color,
                borderRadius: 4,
                bottom: -10,
            }} />
        </View>
    </AppMarker>
}
export default CustomMarker