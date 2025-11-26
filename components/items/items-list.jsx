import { FlatList, View } from "react-native";
import ItemGridSkeleton from "./item-grid-skeleton";
import ItemGrid from "./item-grid";
import ItemListSkeleton from "./item-list-skeleton";
import ItemList from "./item-list";

const ItemsList = ({
    loading,
    items = [],
    showRestaurant,
    showCategory,
    showDescription,
    highlight
}) => {
    // 🧩 Si el número de ítems es impar, agregamos un "null" al final
    const filledItems =
        loading || items.length % 2 === 0
            ? items
            : [...items, null];

    return (
        <FlatList
            contentContainerStyle={{
                paddingHorizontal: 24,
                paddingBottom: 24,
                rowGap: 24,
            }}
            data={loading ? Array.from({ length: items.length || 6 }) : filledItems}
            renderItem={({ item, index }) => {
                const isLeft = index % 2 === 0;

                // 📦 Margen lateral simétrico
                const marginStyle = {
                    flex: 1,
                    marginRight: isLeft ? 12 : 0,
                    marginLeft: !isLeft ? 12 : 0,
                };

                // 🦴 Skeleton loading
                if (loading) {
                    return (
                        <View style={marginStyle}>
                            <ItemListSkeleton
                                showRestaurant={showRestaurant}
                                showCategory={showCategory}
                                showDescription={showDescription}
                            />
                        </View>
                    );
                }

                // ⛔ Si es un placeholder (null), solo devolvemos un View vacío
                if (!item) {
                    return <View style={marginStyle} />;
                }

                // ✅ Item real
                return (
                    <View style={marginStyle}>
                        <ItemList
                            item={item}
                            showRestaurant={showRestaurant}
                            showCategory={showCategory}
                            showDescription={showDescription}
                            highlight={highlight}
                        />
                    </View>
                );
            }}
            keyExtractor={(item, index) =>
                loading ? `skeleton-${index}` : item ? item.id.toString() : `placeholder-${index}`
            }
            numColumns={2}
            scrollEnabled={false}
        />
    );
};

export default ItemsList;
