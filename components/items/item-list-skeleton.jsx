import { View } from "react-native"

const ItemListSkeleton = () => {
    return <View style={{ flexDirection: 'row', marginBottom: 12, backgroundColor: '#fff', borderRadius: 12, elevation: 2, overflow: 'hidden' }}>
        <View style={{ width: 80, height: 80, backgroundColor: '#E0E0E0' }} />
        <View style={{ flex: 1, padding: 12 }}>
            <View style={{ height: 16, width: '60%', backgroundColor: '#E0E0E0', borderRadius: 4, marginBottom: 6 }} />
            <View style={{ height: 12, width: '90%', backgroundColor: '#E0E0E0', borderRadius: 4, marginBottom: 4 }} />
            <View style={{ height: 12, width: '70%', backgroundColor: '#E0E0E0', borderRadius: 4, marginBottom: 8 }} />
            <View style={{ height: 16, width: '30%', backgroundColor: '#E0E0E0', borderRadius: 4 }} />
        </View>
        <View style={{ backgroundColor: '#E0E0E0', width: 32, height: 32, borderRadius: 16, alignSelf: 'center', marginRight: 12 }} />
    </View>
}

export default ItemListSkeleton