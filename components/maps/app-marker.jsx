import isHuawei from "@/hooks/is-huawei"
import { Ionicons } from "@expo/vector-icons"
import { View } from "react-native"
import { Marker } from "react-native-maps"
import { HMSMarker } from '@hmscore/react-native-hms-map';

const AppMarker = isHuawei() ? HMSMarker : Marker

const CustomMarker = ({ title, icon, color, latitude, longitude }) => {
    return (
        <AppMarker
            coordinate={{
                latitude: Number(latitude),
                longitude: Number(longitude)
            }}
            title={title}
            // anchor={{ x: 0.3, y: 0.55 }}
            // centerOffset={{ x: 0, y: 0 }}
            style={{backgroundColor: '#000'}}
            flat={true}
            icon={icon}
            pinColor={color}
        >
            {/* <View style={{
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 30,
                backgroundColor: 'transparent'
            }}>
                <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "#fff",
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: color,
                }}>
                    <Ionicons name={icon} size={16} color={color} />
                </View>
                <View style={{
                    position: 'absolute',
                    width: 8,
                    height: 8,
                    backgroundColor: color,
                    borderRadius: 4,
                    bottom: -4,
                }} />
            </View> */}
        </AppMarker>
    )
}

export default CustomMarker