import { Platform } from 'react-native';
import isHuawei from "@/hooks/is-huawei"
import { Polyline } from "react-native-maps";

let HMSPolyline = null;
if (Platform.OS === 'android' && isHuawei()) {
    try {
        HMSPolyline = require('@hmscore/react-native-hms-map').HMSPolyline;
    } catch (e) {
        console.warn('HMS Polyline not available, falling back to Google Maps Polyline');
    }
}

const AppPolyline = HMSPolyline || Polyline;

export default AppPolyline;