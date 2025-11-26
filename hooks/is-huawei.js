import { Platform } from 'react-native';
import * as Device from 'expo-device';

export default function isHuaweiDevice() {
    return false
    if (Platform.OS !== 'android') return false;

    const manufacturer = Device.manufacturer || "";
    return manufacturer.toLowerCase().includes("huawei");
}