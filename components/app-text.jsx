import { Text } from "react-native"

const AppText = ({ style, weight = "Regular", ...props }) => {
  const fontFamily = `Sen-${weight}`
  return <Text style={[{ fontFamily, color: '#181C2E' }, style]} {...props} />
}

export default AppText