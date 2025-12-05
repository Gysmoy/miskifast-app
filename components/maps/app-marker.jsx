import isHuawei from "@/hooks/is-huawei";
import { Marker } from "react-native-maps"

let HMSMarker = null;
// if (isHuawei()) {
//     try {
//         HMSMarker = require('@hmscore/react-native-hms-map').HMSMarker;
//     } catch (e) {
//         console.warn('HMS Marker not available, falling back to Google Maps Marker');
//     }
// }

const AppMarker = HMSMarker || Marker;

const CustomMarker = ({ title, icon, color, latitude, longitude }) => {
    return (
        <AppMarker
            coordinate={{
                latitude: Number(latitude),
                longitude: Number(longitude)
            }}
            title={title}
            style={{ backgroundColor: '#000' }}
            flat={true}
            icon={icon}
            pinColor={color} />
    )
}

export default CustomMarker