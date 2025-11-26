import { Image, TouchableOpacity, View, ScrollView } from "react-native";
import OffCanvas from "../off-canvas";
import AppText from "../app-text";
import { STORAGE_URL } from "@/constants/settings";
import InputContainer from "../forms/input-container";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "@/src/context/CartContext";

const ItemDetail = ({ selectedItem, setSelectedItem }) => {
    const { addToCart } = useCart();

    return <OffCanvas
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        footer={<View style={{
            backgroundColor: "#F0F5FA",
            padding: 24,
            borderTopRightRadius: 24,
            borderTopLeftRadius: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -12 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 12,
        }}>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                }}
            >
                <AppText weight="ExtraBold" style={{ fontSize: 28, color: "#181C2E" }}>
                    S/{" "}
                    {Number(
                        selectedItem?.selectedPresentation
                            ? selectedItem?.selectedPresentation.price
                            : selectedItem?.price
                    ).toFixed(2)}
                </AppText>

                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#121223",
                        borderRadius: 48,
                        paddingHorizontal: 12,
                        paddingVertical: 12,
                    }}
                >
                    <TouchableOpacity
                        onPress={() =>
                            setSelectedItem((prev) => ({
                                ...prev,
                                quantity: Math.max(1, (prev.quantity || 1) - 1),
                            }))
                        }
                        style={{
                            paddingHorizontal: 4,
                            paddingVertical: 4,
                            backgroundColor: "rgba(255, 255, 255, .2)",
                            borderRadius: 24,
                        }}
                    >
                        <Ionicons name="remove" size={20} color="#fff" />
                    </TouchableOpacity>
                    <AppText
                        style={{
                            marginHorizontal: 12,
                            fontSize: 16,
                            width: 24,
                            color: "#fff",
                            textAlign: "center",
                        }}
                    >
                        {selectedItem?.quantity || 1}
                    </AppText>
                    <TouchableOpacity
                        onPress={() =>
                            setSelectedItem((prev) => ({
                                ...prev,
                                quantity: (prev.quantity || 1) + 1,
                            }))
                        }
                        style={{
                            paddingHorizontal: 4,
                            paddingVertical: 4,
                            backgroundColor: "rgba(255, 255, 255, .2)",
                            borderRadius: 24,
                        }}
                    >
                        <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                style={{
                    backgroundColor: selectedItem?.selectedPresentation
                        ? "#E63946"
                        : "#ccc",
                    paddingVertical: 18,
                    borderRadius: 8,
                    alignItems: "center",
                }}
                onPress={() => {
                    if (!selectedItem?.selectedPresentation) return;
                    const itemToAdd = {
                        id: selectedItem?.id,
                        presentationId: selectedItem?.selectedPresentation.id,
                        name: selectedItem?.name,
                        presentation: selectedItem?.selectedPresentation.presentation,
                        price: selectedItem?.selectedPresentation.price,
                        image: selectedItem?.image,
                        quantity: selectedItem?.quantity || 1,
                        restaurant: {
                            id: selectedItem?.restaurant?.id ?? null,
                            name: selectedItem?.restaurant?.name ?? null,
                        },
                        observation: selectedItem?.observation || "",
                    };
                    addToCart(itemToAdd);
                    setSelectedItem(null);
                }}
                activeOpacity={selectedItem?.selectedPresentation ? 0.9 : 1}
                disabled={!selectedItem?.selectedPresentation}
            >
                <AppText weight="Bold" style={{ color: "#fff", fontSize: 16 }}>
                    AGREGAR AL CARRITO
                </AppText>
            </TouchableOpacity>
        </View>}
    >
        <View style={{ position: "relative" }}>
            <Image
                source={{ uri: `${STORAGE_URL}/item/${selectedItem?.image}` }}
                style={{
                    width: "100%",
                    aspectRatio: 1.8,
                    // borderRadius: 24,
                    resizeMode: "cover",
                    backgroundColor: "#98A8B8",
                }}
            />
            <TouchableOpacity
                onPress={() => setSelectedItem(null)}
                style={{
                    position: "absolute",
                    top: 24,
                    right: 24,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderRadius: 20,
                    padding: 8,
                }}
            >
                <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => { }}
                style={{
                    position: "absolute",
                    bottom: 24,
                    right: 24,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderRadius: 20,
                    padding: 8,
                }}
            >
                <Ionicons name="heart-outline" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
        <View style={{ padding: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, paddingRight: 18, borderRadius: 24, borderWidth: 2, gap: 12, borderColor: '#EDEDED', marginBottom: 24, alignSelf: 'flex-start' }} >
                <Image source={{ uri: `${STORAGE_URL}/restaurant/${selectedItem?.restaurant?.logo}` }} style={{ width: 24, height: 24, borderRadius: 24, backgroundColor: '#98A8B8' }} />
                <AppText style={{ fontSize: 14 }}>{selectedItem?.restaurant?.name}</AppText>
            </View>
            <AppText weight="Bold" style={{ fontSize: 20, flexShrink: 1, marginBottom: 12 }}>
                {selectedItem?.name ?? ''}
            </AppText>
            {
                selectedItem?.description &&
                <AppText style={{ fontSize: 14, color: '#A0A5BA', marginBottom: 12 }}>{selectedItem?.description}</AppText>
            }

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, alignSelf: 'flex-start', gap: 36 }}>
                {/* Estrellas y puntaje */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Ionicons name="star-outline" size={20} color="#E63946" />
                    <AppText weight="Bold" style={{ fontSize: 16 }}>{selectedItem?.rating || '4.5'}</AppText>
                </View>

                {/* Carrito y delivery */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Ionicons name="bicycle" size={20} color={selectedItem?.deliveryFree ? '#4CAF50' : '#E63946'} />
                    <AppText style={{ fontSize: 14 }}>
                        {selectedItem?.deliveryFree ? 'Gratis' : `S/ ${Number(selectedItem?.deliveryPrice || 5).toFixed(2)}`}
                    </AppText>
                </View>

                {/* Reloj y tiempo */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Ionicons name="time-outline" size={20} color="#E63946" />
                    <AppText style={{ fontSize: 14 }}>{selectedItem?.deliveryTime || '25-35'} min</AppText>
                </View>
            </View>

            {selectedItem?.presentations && selectedItem?.presentations.length > 0 && (
                <>
                    <AppText weight='SemiBold' style={{ fontSize: 14, color: '#32343E', marginBottom: 8, textTransform: 'uppercase' }}>Presentaciones:</AppText>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                        {selectedItem.presentations.map((pres) => (
                            <TouchableOpacity
                                key={`${selectedItem.id}-${pres.id}`}
                                onPress={() => setSelectedItem({ ...selectedItem, selectedPresentation: pres })}
                                style={{
                                    paddingVertical: 18,
                                    paddingHorizontal: 24,
                                    borderRadius: 12,
                                    backgroundColor: selectedItem.selectedPresentation?.id === pres.id ? '#E63946' : '#F0F5FA',
                                    marginBottom: 8
                                }}
                            >
                                <AppText weight='Bold' style={{ fontSize: 16, color: selectedItem.selectedPresentation?.id === pres.id ? '#fff' : '#32343E' }}>
                                    {pres.presentation}
                                </AppText>
                                <AppText style={{ fontSize: 14, color: selectedItem.selectedPresentation?.id === pres.id ? '#fff' : '#646982' }}>
                                    S/ {Number(pres.price).toFixed(2)}
                                </AppText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}

            <InputContainer label='Observación' placeholder='Ej: Sin cebolla, con extra de queso...'
                value={selectedItem?.observation}
                setValue={(text) => setSelectedItem(prev => ({ ...prev, observation: text }))}
                multiline={true}
                numberOfLines={2} />
        </View>
    </OffCanvas>
}

export default ItemDetail