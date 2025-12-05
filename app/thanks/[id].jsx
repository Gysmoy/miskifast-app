import { Image, Text, TouchableOpacity, View } from "react-native";
import AuthButton from "../../components/auth/auth-button";
import AppText from "../../components/app-text";
import { router, useLocalSearchParams } from "expo-router";

import image from '@/assets/images/order-completed.png'

export default function ThanksScreen() {
    const { id } = useLocalSearchParams();
    return (
        <View style={{ flex: 1, backgroundColor: "#fff", padding: 24 }}>
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Image
                    source={image}
                    style={{ width: 228, height: 228 }}
                    contentFit="cover"
                    contentPosition="center"
                />
                <AppText weight='Bold' style={{ fontSize: 24, color: "#374151", marginTop: 24, marginBottom: 12 }}>¡Felicidades!</AppText>
                <AppText style={{ fontSize: 14, color: "#525c67", textAlign: "center"}}>
                    Has realizado el pedido con éxito,
                    {"\n"}
                    ¡disfruta de nuestro servicio!
                </AppText>
            </View>
            <AuthButton text='Seguir pedido' onPress={() => router.push(`/tacking/${id}`)} />
        </View>
    );
}