import { Platform } from 'react-native';
import isHuawei from '@/hooks/is-huawei';
import MapView from 'react-native-maps';

let HMSMap = null;
// if (isHuawei()) {
//     try {
//         HMSMap = require('@hmscore/react-native-hms-map').HMSMap;
//     } catch (e) {
//         console.warn('HMS Maps not available, falling back to Google Maps');
//     }
// }

const Map = HMSMap || MapView;

export default Map;
