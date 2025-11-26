import { Image, TouchableOpacity, View } from "react-native";
import { APP_URL } from "../../constants/settings";
import { Ionicons } from "@expo/vector-icons";
import Number2Currency from "../../scripts/number2Currency";
import { useCart } from '@/src/context/CartContext';
import AppText from "@/components/app-text";

const ItemGrid = ({ item, showDescription = true, showRestaurant, showCategory, highlight }) => {
    const { setSelectedItem } = useCart();

    const highlightText = (text, query, color) => {
        if (!text) return null;
        if (!query) return <AppText style={{ color }}>{text}</AppText>;

        // 🧩 Normalizamos ambas cadenas quitando tildes
        const normalize = (str) =>
            str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const normalizedText = normalize(text);
        // Ignorar palabras menores a 3 caracteres
        const terms = query.split(/\s+/).filter(Boolean).filter(t => t.length >= 3);

        if (terms.length === 0) return <AppText style={{ color }}>{text}</AppText>;

        // 🧠 Creamos regex con términos normalizados e ignoramos acentos
        const regex = new RegExp(`(${terms.map(normalize).join("|")})`, "gi");

        // 💡 Partimos el texto normalizado, pero mostramos el texto original
        const parts = normalizedText.split(regex);

        let index = 0;
        return (
            <AppText style={{ color }}>
                {parts.map((part, i) => {
                    const originalSlice = text.slice(index, index + part.length);
                    index += part.length;
                    return regex.test(part) ? (
                        <AppText
                            key={i}
                            weight="Bold"
                            style={{
                                backgroundColor: "rgba(255, 235, 59, 0.4)", // Amarillo suave
                                color: "#000",
                            }}
                        >
                            {originalSlice}
                        </AppText>
                    ) : (
                        <AppText key={i} style={{ color }}>
                            {originalSlice}
                        </AppText>
                    );
                })}
            </AppText>
        );
    };

    return (
        <View style={{
            flex: 1,
            backgroundColor: '#fff',
            borderRadius: 24,
            elevation: 12,
            shadowColor: '#cccccc',
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            overflow: 'hidden',
            padding: 12,
            gap: 12
        }}>
            <View style={{ padding: 6 }}>
                <Image
                    source={{ uri: `${APP_URL}/storage/images/item/${item.image}` }}
                    style={{ width: '100%', aspectRatio: 1.45, backgroundColor: '#98A8B8', borderRadius: 18 }}
                />
            </View>
            {
                item.relevance && (
                    <View style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        borderRadius: 8,
                        paddingHorizontal: 6,
                        paddingVertical: 2
                    }}>
                        <AppText style={{ fontSize: 12, color: '#fff' }}>Acc. {Math.round(item.relevance)}</AppText>
                    </View>
                )
            }
            <View>
                <AppText weight='Bold' style={{ fontSize: 15 }} numberOfLines={1}>
                    {highlightText(item.name, highlight)}
                </AppText>

                {(showRestaurant || showCategory) && (
                    <AppText style={{ fontSize: 13, color: '#646982', marginTop: 4 }} numberOfLines={1}>
                        {showRestaurant && highlightText(item.restaurant?.name, highlight, '#646982')}
                        {showRestaurant && showCategory && ' | '}
                        {showCategory && highlightText(item.category?.name, highlight, '#646982')}
                    </AppText>
                )}
                {showDescription && (
                    <AppText
                        style={{ fontSize: 13, color: '#646982', marginTop: 4, height: 34.5 }}
                        numberOfLines={2}
                    >
                        {highlightText(item.description, highlight, '#646982')}
                    </AppText>
                )}

                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 8
                }}>
                    <AppText weight='ExtraBold' style={{ fontSize: 16, color: '#E63946' }}>
                        S/ {Number2Currency(item.price)}
                    </AppText>

                    <TouchableOpacity
                        onPress={() => setSelectedItem(item)}
                        activeOpacity={0.8}
                        style={{
                            backgroundColor: '#E63946',
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <Ionicons name="add" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default ItemGrid;
