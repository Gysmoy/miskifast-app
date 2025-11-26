import { View } from "react-native"

const AddressSkeleton = () => {
    return <View
        style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#F0F5FA',
            padding: 24,
            borderRadius: 12,
            gap: 18
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18, flexShrink: 1 }}>
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#E0E0E0' }} />
            <View style={{ flexShrink: 1, flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                        <View style={{ width: 80, height: 14, borderRadius: 4, backgroundColor: '#E0E0E0' }} />
                        <View style={{ width: 60, height: 14, borderRadius: 4, backgroundColor: '#E0E0E0' }} />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: '#E0E0E0' }} />
                        <View style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: '#E0E0E0' }} />
                    </View>
                </View>
                <View style={{ width: '100%', height: 14, borderRadius: 4, marginBottom: 3, backgroundColor: '#E0E0E0' }} />
                <View style={{ width: '100%', height: 14, borderRadius: 4, marginBottom: 3, backgroundColor: '#E0E0E0' }} />
                <View style={{ width: '50%', height: 14, borderRadius: 4, marginBottom: 3, backgroundColor: '#E0E0E0' }} />
            </View>
        </View>
    </View>
}

export default AddressSkeleton