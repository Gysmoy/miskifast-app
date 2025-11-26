import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    Alert,
    Animated
} from 'react-native';
import { router } from 'expo-router';
import { useCart } from '@/src/context/CartContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const { addToCart, categories, loadIndex } = useCart();
    const slideAnim = React.useRef(new Animated.Value(300)).current;
    const [selectedDish, setSelectedDish] = React.useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const handleCategoryPress = (category) => {
        router.push(`/category/${category.id}`);
    };

    // Duplicate array for infinite scroll illusion
    const featured = categories.filter(({ featured }) => featured)

    // Pick 4 random dishes from all categories
    const randomDishes = [];

    const handleAddToCart = (dish) => {
        addToCart(dish);
        Alert.alert('¡Agregado!', `${dish.name} se agregó al carrito`);
    };

    const openOffcanvas = (dish) => {
        setSelectedDish(dish);
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeOffcanvas = () => {
        Animated.timing(slideAnim, {
            toValue: 300,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setSelectedDish(null));
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadIndex();
        setRefreshing(false);
    };

    return (<>
        <View style={styles.container}>
           
        </View>
    </>);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerLogo: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1877F2',
        letterSpacing: 1,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#888',
        marginTop: 2,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    banner: {
        width: width - 32,
        height: 120,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    bannerOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 16,
    },
    bannerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    bannerSubtitle: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
        marginTop: 2,
    },
    featuredCategories: {
        marginBottom: 24,
    },
    featuredTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#222',
        marginBottom: 12,
    },
    featuredScroll: {
        height: 180,
    },
    featuredCard: {
        width: width - 32,
        height: 160,
        // marginRight: 0,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
    },
    featuredImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    featuredOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        padding: 16,
    },
    featuredName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    featuredItems: {
        fontSize: 12,
        color: '#fff',
        opacity: 0.85,
        marginTop: 2,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: (width - 40) / 2,
        height: 130,
        marginBottom: 12,
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
    },
    categoryImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    categoryOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 10,
    },
    categoryName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    categoryItems: {
        fontSize: 11,
        color: '#fff',
        opacity: 0.8,
        marginTop: 1,
    },
    recommendedSection: {
        marginTop: 24,
        marginBottom: 24,
    },
    recommendedScroll: {
        paddingBottom: 4,
    },
    recommendedCardWrapper: {
        width: 140,
        marginRight: 12,
        position: 'relative',
    },
    recommendedCard: {
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
    },
    recommendedImage: {
        width: '100%',
        height: 100,
        resizeMode: 'cover',
    },
    recommendedInfo: {
        backgroundColor: '#fff',
        padding: 10,
    },
    recommendedName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#222',
    },
    recommendedPrice: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    addToCartButton: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: '#ff6600',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
    },
    addToCartText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    offcanvas: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    offcanvasHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    offcanvasTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#222',
        flexShrink: 1,
    },
    closeButton: {
        padding: 4,
    },
    closeButtonText: {
        fontSize: 18,
        color: '#888',
    },
    offcanvasImage: {
        width: '100%',
        height: 160,
        borderRadius: 12,
        marginBottom: 12,
        resizeMode: 'cover',
    },
    offcanvasDescription: {
        fontSize: 14,
        color: '#555',
        marginBottom: 8,
    },
    offcanvasPrice: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ff6600',
        marginBottom: 16,
    },
    offcanvasAddButton: {
        backgroundColor: '#ff6600',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    offcanvasAddButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});