import { Image, TouchableOpacity, View } from "react-native"
import AppText from "../app-text"
import { STORAGE_URL } from "../../constants/settings"
import { router } from "expo-router"

const SimpleCategory = ({ id, image, name, items_count }) => {
    return <TouchableOpacity
        key={id}
        style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 8,
            borderRadius: 30,
            gap: 8,
            backgroundColor: '#fff',
            elevation: 12,
            shadowColor: '#cccccc',
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            overflow: 'hidden',
            marginRight: 12,
        }}
        onPress={() => router.push(`/category/${id}`)}
    >
        <Image
            source={{ uri: `${STORAGE_URL}/category/${image}` }}
            style={{
                width: 44,
                height: 44,
                borderRadius: 20,
            }}
        />
        <View>
            <AppText
                style={{
                    color: '#32343E'
                }}
            >
                {name}
            </AppText>
            <AppText style={{ fontSize: 12, color: '#646982' }}>
                {items_count || 0} platos
            </AppText>
        </View>
    </TouchableOpacity>
}

export default SimpleCategory