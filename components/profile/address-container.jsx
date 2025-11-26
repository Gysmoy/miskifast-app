import { Ionicons } from "@expo/vector-icons"
import { TouchableOpacity, View } from "react-native"
import AppText from "../app-text"
import AddressTags from "../../src/data/AddresTags"

const addressTags = new AddressTags()

const AddressContainer = ({ tag, name, street, number, district, city, department, reference, onEdit = () => { }, onDelete = () => { } }) => {
    const addressTag = addressTags.getById(tag)
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
            <Ionicons name={addressTag?.icon} size={20} color={addressTag?.color} />
            <View style={{ flexShrink: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                        <AppText style={{ fontSize: 14, color: '#32343E', textTransform: 'uppercase' }}>{name}</AppText>
                        <AppText style={{ fontSize: 14, color: 'rgba(50, 52, 62, 0.5)', textTransform: 'uppercase' }}>{addressTag.pretty}</AppText>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <TouchableOpacity onPress={onEdit}>
                            <Ionicons name="pencil" size={18} color="#2790C3" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onDelete}>
                            <Ionicons name="trash" size={18} color="#FF4D4F" />
                        </TouchableOpacity>
                    </View>
                </View>
                <AppText style={{ flexWrap: 'wrap' }}>
                    <AppText>{street || 'SD'} {number || 'SN'}, {district}, {city}, {department}</AppText> <AppText style={{ color: 'rgba(50, 52, 62, 0.5)' }}>{reference}</AppText>
                </AppText>
            </View>
        </View>
    </View>
}

export default AddressContainer