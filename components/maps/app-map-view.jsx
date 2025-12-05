import isHuawei from '@/hooks/is-huawei'
import HMSMap from '@hmscore/react-native-hms-map';
import MapView from 'react-native-maps';
const AppMap = isHuawei() ? HMSMap : MapView;

export default AppMap