import { View } from "react-native"

const ItemGridSkeleton = ({ showRestaurant, showCategory, showDescription }) => {
    return <View style={{
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 12,
        shadowColor: '#96969A',
        overflow: 'hidden'
    }}>
        <View style={{ width: '100%', aspectRatio: 4 / 3, backgroundColor: '#E0E0E0' }} />
        <View style={{ padding: 12 }}>
            <View style={{ height: 16, width: '60%', backgroundColor: '#E0E0E0', borderRadius: 4, marginBottom: 8 }} />
            {
                showRestaurant && showCategory &&
                <View style={{ flexDirection: 'row', gap: 4, marginBottom: 8 }}>
                    {showRestaurant && <View style={{ height: 12, width: '40%', backgroundColor: '#E0E0E0', borderRadius: 4 }} />}
                    {showCategory && <View style={{ height: 12, width: '50%', backgroundColor: '#E0E0E0', borderRadius: 4 }} />}
                </View>
            }
            {
                showDescription && <>
                    <View style={{ height: 12, width: '100%', backgroundColor: '#E0E0E0', borderRadius: 4, marginBottom: 4 }} />
                    <View style={{ height: 12, width: '70%', backgroundColor: '#E0E0E0', borderRadius: 4, marginBottom: 12 }} />
                </>
            }
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ height: 16, width: '30%', backgroundColor: '#E0E0E0', borderRadius: 4 }} />
                <View style={{ backgroundColor: '#E0E0E0', width: 28, height: 28, borderRadius: 14 }} />
            </View>
        </View>
    </View>
}

export default ItemGridSkeleton