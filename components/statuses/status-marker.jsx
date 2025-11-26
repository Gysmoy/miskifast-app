import { View, Animated } from "react-native"
import AppText from "../app-text"
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useRef } from "react"

const StatusMarker = ({ children, loading, filled, isLast = false }) => {
    const spinValue = useRef(new Animated.Value(0)).current

    useEffect(() => {
        if (filled || !loading) return
        const spin = () => {
            spinValue.setValue(0)
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true
            }).start(() => spin())
        }
        spin()
        return () => spinValue.stopAnimation()
    }, [loading])

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    })

    return <>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View style={{
                width: 18, height: 18,
                borderRadius: 9,
                backgroundColor: filled || loading ? '#FF4D4F' : '#BFBCBA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {
                    (loading && !filled)
                        ? <Animated.View style={{ transform: [{ rotate: spin }] }}>
                            <Ionicons name='sync' size={10} color='#ffffff' />
                        </Animated.View>
                        : <Ionicons name='checkmark' size={10} color='#ffffff' />
                }
            </View>
            <AppText style={{ fontSize: 13, color: filled ? '#FF4D4F' : '#A0A5BA' }}>{children}</AppText>
        </View>
        {
            !isLast &&
            <View style={{ height: 12, width: 2, backgroundColor: filled ? '#FF4D4F' : '#BFBCBA', marginHorizontal: 8 }} />
        }
    </>
}

export default StatusMarker