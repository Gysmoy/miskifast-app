import { View } from "react-native"
import AppText from "../app-text"
import Number2Currency from "../../scripts/number2Currency"

const CartHeader = ({ name, amount }) => {
    return <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 12 }}>
        <AppText weight='Bold' style={{ fontSize: 16, color: '#fff', textTransform: 'uppercase', marginRight: 8 }}>
            {name}
        </AppText>
        <View style={{ flex: 1, height: 2, backgroundColor: '#fff', opacity: 0.1 }} />
        <AppText weight='ExtraBold' style={{ fontSize: 16, color: '#fff' }}>
            S/ {Number2Currency(amount)}
        </AppText>
    </View>
}

export default CartHeader