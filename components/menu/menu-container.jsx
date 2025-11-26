import { View } from "react-native"

const MenuContainer = ({ children }) => {
    return <View
        style={{
            backgroundColor: '#F6F8FA',
            borderRadius: 18,
            marginBottom: 24,
            paddingVertical: 12,
            gap: 6
        }}
    >{children}</View>
}

export default MenuContainer