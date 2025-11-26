import isHuawei from "@/hooks/is-huawei"
import { Polyline } from "react-native-maps";
import { HMSPolyline } from '@hmscore/react-native-hms-map';

const AppPolyline = isHuawei() ? HMSPolyline : Polyline

export default AppPolyline