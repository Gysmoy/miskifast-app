import { Animated, View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";

const SimpleSkeleton = ({ flex, loading = false, filled = false }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const [width, setWidth] = useState(0);

    useEffect(() => {
        if (loading && !filled && width > 0) {
            translateX.setValue(-width); // arranca fuera
            Animated.loop(
                Animated.timing(translateX, {
                    toValue: width,
                    duration: 1300,
                    useNativeDriver: true,
                })
            ).start();
        }
    }, [loading, filled, width]);

    return (
        <View
            onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
            style={{
                flex,
                backgroundColor: filled ? '#FF4D4F' : '#F1F1F1',
                overflow: "hidden",
            }}
        >
            {loading && !filled && width > 0 && (
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            transform: [{ translateX }],
                        },
                    ]}
                >
                    <LinearGradient
                        colors={['#ffffff00', '#FF4D4F55', '#FF4D4F55', '#FF4D4F55', '#ffffff00']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={StyleSheet.absoluteFill}
                    />
                </Animated.View>
            )}
        </View>
    );
};

export default SimpleSkeleton;

