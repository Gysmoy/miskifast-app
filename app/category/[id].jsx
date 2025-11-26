import { useEffect, useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/src/context/CartContext';
import ItemsRest from '@/src/data/ItemsRest';
import RestaurantsRest from '@/src/data/RestaurantsRest';
import TitleContainer from '../../components/title-container';
import RestaurantList from '../../components/restaurants/restaurant-list';
import AppText from "@/components/app-text"
import ItemsGrid from '../../components/items/items-grid';

const itemsRest = new ItemsRest()
const restaurantsRest = new RestaurantsRest()

export default function CategoryScreen() {
  const { id } = useLocalSearchParams();
  const { categories } = useCart();
  const category = categories.find(cat => cat.id == id);

  const [items, setItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(false)

  if (!category) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <AppText>Categoría no encontrada</AppText>
      </View>
    );
  }

  const getItems = async () => {
    setIsLoading(true);
    const result = await itemsRest.byCategory(category.id);
    setItems(result ?? []);
    setIsLoading(false);
  };

  const getRestaurants = async () => {
    const result = await restaurantsRest.byCategory(category.id)
    setRestaurants(result ?? [])
  }

  useEffect(() => {
    if (!category) return
    getItems()
    getRestaurants()
  }, [category]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 24, gap: 12 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, padding: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <AppText style={{ fontSize: 17, color: '#181C2E' }}>{category.name}</AppText>
      </View>
      <ScrollView >

        <ItemsGrid loading={isLoading} items={items} />
        {
          restaurants.length > 0 &&
          <>
            <TitleContainer title="Restaurantes abiertos" style={{ paddingHorizontal: 24, marginBottom: 24 }} />
            <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 24 }}>
                {restaurants.map((restaurant, index) => <RestaurantList key={index} restaurant={restaurant} showCategories={false} />)}
              </View>
            </View>
          </>
        }
      </ScrollView>
    </View>
  );
}
