import { SafeAreaView } from "react-native-safe-area-context";
import { Animated, Image, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons";

import isotipo from '@/assets/images/isotipo.png'
import decoration from '@/assets/images/decoration.png'
import AppText from "../app-text";

const AuthContainer = ({ title, description, showBack, backHref, children }) => {
    const scrollY = useState(new Animated.Value(0))[0];

    const headerHeight = scrollY.interpolate({
        inputRange: [0, 120],
        outputRange: [220, 100],
        extrapolate: 'clamp',
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 120],
        outputRange: [1, 0.6],
        extrapolate: 'clamp',
    });

    return <View style={{ flex: 1, backgroundColor: '#ffffff', }}>
        <Animated.ScrollView
            keyboardShouldPersistTaps='handled'
            contentContainerStyle={{ flexGrow: 1 }}
            scrollEventThrottle={16}
            onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false }
            )}
        >
            <Animated.View style={{
                height: headerHeight,
                paddingHorizontal: 24,
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#1a1a2e',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                {/* Decoración de fondo */}
                <Image
                    source={decoration}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 180,
                        height: 180,
                        objectFit: 'contain',
                        tintColor: 'white',
                    }}
                />
                <Image
                    source={isotipo}
                    style={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 200,
                        height: 200,
                        objectFit: 'contain',
                        transform: [{ rotate: '-30deg' }],
                        tintColor: 'white',
                        opacity: 0.0625
                    }}
                />
                {
                    showBack &&
                    <TouchableOpacity
                        onPress={() => typeof backHref == 'string' ? router.replace(backHref) : backHref()}
                        style={{
                            backgroundColor: '#ffffff',
                            position: 'absolute',
                            top: 24,
                            left: 24,
                            borderRadius: 20, padding: 8
                        }}>
                        <Ionicons
                            name="chevron-back" size={24} color="#5E616F" />
                    </TouchableOpacity>
                }
                <Animated.View style={{ opacity: headerOpacity }}>
                    <AppText style={{
                        fontSize: 30,
                        color: '#fff',
                        textAlign: 'center',
                        marginBottom: 8,
                        textTransform: 'uppercase'
                    }} weight="Bold">{title}</AppText>

                    <AppText style={{
                        fontSize: 16,
                        color: '#aaa',
                        textAlign: 'center',
                    }}>{description}</AppText>
                </Animated.View>
            </Animated.View>

            <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                <View style={{ backgroundColor: '#1a1a2e' }}>
                    <View style={{
                        paddingHorizontal: 24,
                        paddingVertical: 24,
                        backgroundColor: '#ffffff',
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        height: 'auto',
                        gap: 24,
                    }}>
                        {children}
                    </View>
                </View>
            </View>
        </Animated.ScrollView>
    </View>
}

export default AuthContainer