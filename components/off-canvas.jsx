import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Animated,
  PanResponder,
  ScrollView,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OffCanvas = ({ isOpen, onClose, footer, children }) => {
  const slideAnim = useRef(new Animated.Value(1000)).current;
  const scrollY = useRef(0);

  const open = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const close = () => {
    Animated.timing(slideAnim, {
      toValue: 1000,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose && onClose());
  };

  // 🔙 Interceptar el botón físico "back"
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isOpen) {
        close();
        return true; // evita que la app navegue hacia atrás
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) open();
    else close();
  }, [isOpen]);

  // 🎢 Swipe down cuando scroll está arriba
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: (_, gestureState) => {
        // captura el gesto si estamos en el tope del scroll
        return scrollY.current <= 0 && gestureState.dy > 0;
      },
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return scrollY.current <= 0 && gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) slideAnim.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120) close();
        else open();
      },
    })
  ).current;

  if (!isOpen) return null;

  return (
    <>
      {/* Fondo semitransparente */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1,
        }}
        activeOpacity={1}
        onPress={close}
      />

      {/* Contenedor animado */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          top: 0,
          backgroundColor: 'transparent',
          zIndex: 2,
          transform: [{ translateY: slideAnim }],
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
          {/* <View style={{
            marginVertical: 9,
            height: 8,
            backgroundColor: '#eee',
            width: 100,
            borderRadius: 4,
            alignSelf: 'center',
          }}></View> */}
          <ScrollView
            onScroll={(e) => (scrollY.current = e.nativeEvent.contentOffset.y)}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {/* Footer fijo */}
          {footer}
        </SafeAreaView>
      </Animated.View>
    </>
  );
};

export default OffCanvas;
