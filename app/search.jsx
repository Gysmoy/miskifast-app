import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Keyboard, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/src/context/CartContext';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InputContainer from '../components/forms/input-container';
import AppText from '../components/app-text';
import ItemsRest from '../src/data/ItemsRest';
import RestaurantCompact from '../components/restaurants/restaurant-compact';
import ItemsGrid from '../components/items/items-grid';
import Toast from 'react-native-toast-message';

import emojiSad from '@/assets/images/emoji_sad.png'

const itemsRest = new ItemsRest();

const DEFAULT_RECENT_KEYWORDS = ['Hamburguesa', 'Pizza', 'Tacos', 'Ensalada'];
const RECENT_KEYWORDS_KEY = '@MiskyFast:recentKeywords';

export default function SearchScreen() {
  const { restaurants, getTotalItems } = useCart();
  const totalItems = getTotalItems();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentKeywords, setRecentKeywords] = useState(DEFAULT_RECENT_KEYWORDS);
  const [bestSaleItems, setBestSaleItems] = useState([]);

  // Load recent keywords and best sale items on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(RECENT_KEYWORDS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRecentKeywords(parsed);
          }
        }
      } catch (e) {
        console.warn('Failed to load recent keywords:', e);
      }

      try {
        const bestSaleRes = await itemsRest.bestSale();
        setBestSaleItems(bestSaleRes ?? []);
      } catch (err) {
        console.warn('Failed to load best sale items:', err);
        setBestSaleItems([]);
      }
    })();
  }, []);

  // Persist recent keywords to AsyncStorage whenever they change
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(RECENT_KEYWORDS_KEY, JSON.stringify(recentKeywords));
      } catch (e) {
        console.warn('Failed to save recent keywords:', e);
      }
    })();
  }, [recentKeywords]);

  // Show helper content again when query is cleared
  useEffect(() => {
    if (!searchQuery.trim()) {
      setHasSearched(false);
      setSearchResults([]);
    }
  }, [searchQuery]);

  const addRecentKeyword = (keyword) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    setRecentKeywords((prev) => {
      const filtered = prev.filter((k) => k.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 10);
      return updated;
    });
  };

  const performSearch = async (query) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }
    if (trimmed.length < 3) {
      Toast.show({
        text1Style: {
          fontFamily: 'Sen-Bold',
          fontSize: 15
        },
        text2Style: {
          fontFamily: 'Sen-Regular',
          fontSize: 13
        },
        type: 'info',
        text1: 'Ingresa al menos 3 caracteres para buscar',
        position: 'top',
      });
      return;
    }
    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await itemsRest.search(trimmed);
      const data = results?.data ?? [];
      setSearchResults(data);
      // Only save as recent keyword if at least one result is found
      if (data.length > 0) {
        addRecentKeyword(trimmed);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRecentKeywordPress = (keyword) => {
    Keyboard.dismiss();
    setSearchQuery(keyword);
    performSearch(keyword);
  };

  const handleSearchPress = () => {
    Keyboard.dismiss();
    const query = searchQuery.trim() || (recentKeywords[0] ?? '');
    setSearchQuery(query);
    performSearch(query);
  };

  const suggestedRestaurants = restaurants.filter(({ featured }) => featured);

  // Determine if we should show the helper content (recent keywords + suggested restaurants)
  const showHelperContent = !hasSearched;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 24, gap: 12 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 24, padding: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <AppText style={{ flex: 1, fontSize: 17, color: '#181C2E' }}>Buscar</AppText>
        <TouchableOpacity style={{ backgroundColor: '#181C2E', borderRadius: 24, padding: 8 }} onPress={() => router.push('/cart')}>
          <Ionicons name="cart-outline" size={24} color="#fff" />
          <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: '#FF4D4F', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, minWidth: 20, alignItems: 'center', justifyContent: 'center' }}>
            <AppText weight='Bold' style={{ color: '#fff', fontSize: 12, lineHeight: 12 }}>{totalItems}</AppText>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{}}
        keyboardShouldPersistTaps='handled'
      >
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 24, paddingHorizontal: 24 }}>
          <View style={{ flex: 1 }}>
            <InputContainer
              autoFocus
              icon="search-outline"
              value={searchQuery}
              setValue={setSearchQuery}
              placeholder={recentKeywords[0]}
              type='search'
              onSearch={performSearch}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity onPress={handleSearchPress}>
            <AppText weight='SemiBold' style={{ fontSize: 16, color: '#FF4D4F' }}>Buscar</AppText>
          </TouchableOpacity>
        </View>

        {showHelperContent && (
          <>
            {/* Búsquedas recientes */}
            <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
              <AppText style={{ fontSize: 20, fontWeight: '600', marginBottom: 12 }}>
                Búsquedas recientes
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }} keyboardShouldPersistTaps='handled'>
                {recentKeywords.map((keyword, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleRecentKeywordPress(keyword)}
                    style={{ paddingHorizontal: 18, paddingVertical: 12, borderRadius: 24, borderWidth: 2, borderColor: '#EDEDED', marginRight: 8 }}
                  >
                    <AppText style={{ fontSize: 16 }}>{keyword}</AppText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
              <AppText style={{ fontSize: 20, fontWeight: '600', color: '#181C2E', marginBottom: 12 }}>
                Restaurantes sugeridos
              </AppText>
              <View style={{ gap: 12 }}>
                {suggestedRestaurants.map((item) => (
                  <React.Fragment key={item.id}>
                    <RestaurantCompact restaurant={item} showCategories={false} />
                    <View style={{ height: 2, borderRadius: 1, backgroundColor: '#EBEBEB' }} />
                  </React.Fragment>
                ))}
              </View>
            </View>


            <View style={{ paddingHorizontal: 24, marginBottom: 12 }}>
              <AppText style={{ fontSize: 20, fontWeight: '600', color: '#181C2E' }}>
                Popular Fast food
              </AppText>
            </View>
            <ItemsGrid
              loading={false}
              items={bestSaleItems}
              showRestaurant={true}
              showCategory={true}
              showDescription={true}
              skeletons={4}
            />
          </>
        )}

        {hasSearched && searchQuery.length > 0 && !isSearching && searchResults.length === 0 && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={emojiSad}
              style={{
                width: 100,
                height: 100,
                objectFit: 'contain',
                tintColor: '#181C2E',
              }}
            />
            <AppText weight='Bold' style={{ fontSize: 24, marginTop: 24, marginBottom: 12 }}>¡Ups!</AppText>
            <AppText style={{ fontSize: 14, color: '#525c67' }}>No hay resultados para esta búsqueda</AppText>
          </View>
        )}

        {hasSearched && searchQuery.length > 0 && searchResults.length > 0 && (
          <ItemsGrid loading={isSearching} items={searchResults} showRestaurant={true} showCategory={true} showDescription={true} highlight={searchQuery} skeletons={4} />
        )}
      </ScrollView>
      <Toast />
    </View>
  );
}
