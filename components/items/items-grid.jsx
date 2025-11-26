import { FlatList, View } from "react-native";
import ItemGridSkeleton from "./item-grid-skeleton";
import ItemGrid from "./item-grid";

const ItemsGrid = ({
    loading,
    items = [],
    showRestaurant,
    showCategory,
    showDescription,
    highlight,
    skeletons = 6
}) => {
    // 🧩 Si el número de ítems o skeletons es impar, agregamos un "null" al final
    const filledItems = (() => {
        if (loading) {
            const skeletonArray = Array.from({ length: skeletons }).fill('Something');
            return skeletonArray.length % 2 === 0
                ? skeletonArray
                : [...skeletonArray, null];
        } else {
            return items.length % 2 === 0
                ? items
                : [...items, null];
        }
    })();

    return (
        <FlatList
            contentContainerStyle={{
                paddingHorizontal: 24,
                paddingBottom: 24,
                rowGap: 24,
            }}
            data={filledItems}
            renderItem={({ item, index }) => {
                const isLeft = index % 2 === 0;

                // 📦 Margen lateral simétrico
                const marginStyle = {
                    flex: 1,
                    marginRight: isLeft ? 12 : 0,
                    marginLeft: !isLeft ? 12 : 0,
                };

                // Si el item es null → espacio vacío
                if (!item) {
                    return <View style={marginStyle} />;
                }

                if (loading) {
                    return (
                        <View style={marginStyle}>
                            <ItemGridSkeleton
                                showRestaurant={showRestaurant}
                                showCategory={showCategory}
                                showDescription={showDescription}
                            />
                        </View>
                    );
                }

                return (
                    <View style={marginStyle}>
                        <ItemGrid
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
                loading
                    ? `skeleton-${index}`
                    : item
                    ? item.id.toString()
                    : `placeholder-${index}`
            }
            numColumns={2}
            scrollEnabled={false}
        />
    );
};

export default ItemsGrid;
