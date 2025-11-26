import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import AppText from "@/components/app-text"

const TitleContainer = ({ title, href, buttonText, style }) => {
    return <View style={style}>
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
        }}>
            <AppText style={{ fontSize: 20 }}>{title}</AppText>
            {
                href &&
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => router.push(href)}>
                    <AppText style={{ fontSize: 16, color: '#FF4D4F' }}>
                        {buttonText}
                        <Ionicons name="chevron-forward" size={16} color="#FF4D4F" />
                    </AppText>
                </TouchableOpacity>
            }
        </View>
    </View>
}

export default TitleContainer;