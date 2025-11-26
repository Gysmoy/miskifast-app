import React, { useEffect, useRef, useState } from "react"
import { View, Animated, Dimensions, TouchableOpacity } from "react-native"
import { Polyline } from "react-native-maps";
import AppMapView from '@/components/maps/app-map-view'
import AppText from "../app-text"
import { Image } from "react-native"
import { APP_URL, STORAGE_URL } from "@/constants/settings"
import AppMarker from "@/components/maps/app-marker"
import decodePolyline from '@/scripts/decode-polyline'
import GMapsRest from '@/src/data/GMapsRest'
import SimpleSkeleton from '@/components/skeleton/simple-skeleton'
import StatusMarker from '@/components/statuses/status-marker'
import { Ionicons } from "@expo/vector-icons";
import AppPolyline from '@/components/maps/app-polyline';

const gMapsRest = new GMapsRest()

const PendingOrder = ({ created_at, restaurant, status, delivery_latitude, delivery_longitude, delivery_status, delivery, details, statuses }) => {
    const [mainRoute, setMainRoute] = useState([]);
    const [altRoutes, setAltRoutes] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const bannerAnim = useRef(new Animated.Value(0)).current;

    const statusImage = `${STORAGE_URL}/status/${status?.image}`

    const isFilled = (stepId) => {
        const stepStatus = statuses.find(s => s.id === stepId);
        if (!stepStatus) return false;
        const currentStatus = stepStatus.type === 'order' ? status : delivery_status;
        return currentStatus && stepStatus.order <= currentStatus.order;
    };

    useEffect(() => {
        const fetchRoute = async () => {
            try {
                const routes = await gMapsRest.routes(
                    {
                        latitude: restaurant.latitude,
                        longitude: restaurant.longitude
                    },
                    {
                        latitude: delivery_latitude,
                        longitude: delivery_longitude
                    }
                );

                if (!routes || routes.length === 0) return;

                // Principal
                const mainPoly = decodePolyline(routes[0].overview_polyline.points);
                setMainRoute(mainPoly);

                // Alternativas
                const alts = routes.slice(1).map(r =>
                    decodePolyline(r.overview_polyline.points)
                );
                setAltRoutes(alts);

            } catch (e) {
                console.log("Error cargando ruta:", e);
            }
        };

        if (
            restaurant &&
            delivery_latitude &&
            delivery_longitude &&
            status?.id === 'f7b3f073-c8bf-49c9-ba6d-fcdfe82395dc'
        ) {
            fetchRoute();
        }
    }, [restaurant, delivery_latitude, delivery_longitude, status]);

    useEffect(() => {
        Animated.timing(bannerAnim, {
            toValue: expanded ? 1 : 0,
            duration: 250,
            useNativeDriver: false
        }).start();
    }, [expanded]);

    return (
        <View style={{ flex: 1 }}>
            {/* Map background */}
            <AppMapView
                style={{ flex: 1 }}
                customMapStyle={GMapsRest.cleanMapStyle()}
                initialRegion={{
                    latitude: (Number(restaurant?.latitude || -12.0464) + Number(delivery_latitude || -12.0464)) / 2,
                    longitude: (Number(restaurant?.longitude || -77.0428) + Number(delivery_longitude || -77.0428)) / 2,
                    latitudeDelta: 0.008,
                    longitudeDelta: 0.008
                }}
            >
                {/* Restaurant marker */}
                {restaurant?.latitude && restaurant?.longitude && (
                    <AppMarker
                        latitude={restaurant.latitude}
                        longitude={restaurant.longitude}
                        title={restaurant.name}
                        color='#FF4D4F'
                        icon='restaurant'
                    />
                )}

                {/* Delivery (customer) marker */}
                {delivery_latitude && delivery_longitude && (
                    <AppMarker
                        latitude={delivery_latitude}
                        longitude={delivery_longitude}
                        title='Entrega'
                        color='#10c469'
                        icon='home'
                    />
                )}

                {/* RUTAS ALTERNATIVAS */}
                {altRoutes.length > 0 &&
                    altRoutes.map((coords, i) => (
                        <AppPolyline
                            key={`alt-${i}`}
                            coordinates={coords}
                            strokeColor="rgba(255, 77, 79, 0.35)"   // rojito suave
                            strokeWidth={3}
                        />
                    ))
                }

                {/* RUTA PRINCIPAL */}
                {mainRoute.length > 0 && (
                    <AppPolyline
                        coordinates={mainRoute}
                        strokeColor="#FF4D4F"   // rojo principal
                        strokeWidth={4}
                    />
                )}
            </AppMapView>

            {/* Expandable banner - always at bottom with content height */}
            <Animated.View
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: '#ffffff',
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 12,
                    maxHeight: bannerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [280, Dimensions.get('window').height * 0.9]
                    })
                }}
            >
                {/* Chevron toggle */}
                <TouchableOpacity
                    style={{ alignSelf: 'center' }}
                    onPress={() => setExpanded(!expanded)}
                >
                    <AppText weight="ExtraBold" style={{
                        fontSize: 24,
                        color: '#D8E3ED',
                        marginTop: expanded ? 16 : 0,
                        marginBottom: expanded ? 0 : 16
                    }}>{expanded ? '﹀' : '︿'}</AppText>
                </TouchableOpacity>

                {/* Collapsed content */}
                <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
                    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 24 }}>
                        <Image
                            source={{ uri: `${APP_URL}/storage/images/restaurant/${restaurant.logo}` }}
                            style={{
                                width: 64, height: 64,
                                borderRadius: 12,
                                backgroundColor: '#818F9C',
                            }}
                        />
                        <View style={{ flex: 1 }}>
                            <AppText style={{ fontSize: 18, marginBottom: 6 }}>{restaurant?.name}</AppText>
                            <AppText style={{ fontSize: 14, marginBottom: 12, color: '#A0A5BA' }}>
                                Pedido el {new Date(created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} a las {new Date(created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true }).replace('a.m.', 'am').replace('p.m.', 'pm')}
                            </AppText>
                            <View>
                                {details?.map((item, idx) => (
                                    <View key={idx} style={{ flexDirection: 'row', marginBottom: 4, gap: 6 }}>
                                        <AppText weight="Bold" style={{ fontSize: 13, color: '#646982' }}>{item.quantity}x</AppText>
                                        <AppText style={{ fontSize: 13, color: '#646982' }}>{item.item}</AppText>
                                        <AppText style={{ fontSize: 12, color: '#A0A5BA' }}>{item.presentation}</AppText>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Timeline blocks */}
                    <View style={{ flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', gap: 6, marginBottom: 12 }}>
                        <SimpleSkeleton flex={25}
                            filled={isFilled('be7e24c9-a3e4-444e-adab-bb301b4ccce3')}
                            loading={isFilled('56844089-7edf-4c9e-9d09-6874624c37b2')}
                        />
                        <SimpleSkeleton flex={50}
                            filled={isFilled('f0a538f0-8aef-4ca7-80d1-297ab6c58279')}
                            loading={isFilled('be7e24c9-a3e4-444e-adab-bb301b4ccce3')}
                        />
                        <SimpleSkeleton flex={25}
                            filled={isFilled('a0618dce-62e9-4720-8e1f-10f3208c357e', 'delivery')}
                            loading={isFilled('f0a538f0-8aef-4ca7-80d1-297ab6c58279')}
                        />
                    </View>
                    <View>
                        {status.id == 'f7b3f073-c8bf-49c9-ba6d-fcdfe82395dc' ? <>
                            <AppText weight='Bold' style={{ fontSize: 13 }}>{delivery_status?.name}</AppText>
                            <AppText style={{ fontSize: 13, color: '#A0A5BA' }}>{delivery_status?.description}</AppText>
                        </> : <>
                            <AppText weight='Bold' style={{ fontSize: 13 }}>{status?.name}</AppText>
                            <AppText style={{ fontSize: 13, color: '#A0A5BA' }}>{status?.description}</AppText>
                        </>}
                    </View>
                </View>

                {/* Expanded content */}
                {expanded && <>
                    <View style={{ padding: 24 }}>
                        <View style={{ alignItems: 'center', marginBottom: 48 }}>
                            <AppText weight="ExtraBold" style={{ fontSize: 30 }}>20 min</AppText>
                            <AppText style={{ fontSize: 14, color: '#A0A5BA', textTransform: 'uppercase' }}>Tiempo estimado de entrega</AppText>
                        </View>
                        <View>
                            {statuses
                                .filter(({ trackeable }) => trackeable)
                                .sort((a, b) => a.order - b.order)
                                .map((s, idx, all) => {
                                    const isLoading = (idx == 0 || isFilled(all[idx - 1]?.id, s.type)) ?? true
                                    return <StatusMarker
                                        key={idx}
                                        filled={isFilled(s.id, s.type)}
                                        loading={isLoading}
                                        isLast={idx === all.length - 1}
                                    >
                                        {s.description}
                                    </StatusMarker>
                                })}
                        </View>
                    </View>
                    {
                        delivery && <View style={{
                            borderWidth: 1,
                            borderColor: '#E8E8E8',
                            padding: 24,
                            flexDirection: 'row',
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            alignItems: 'center',
                            gap: 12
                        }}>
                            <Image
                                source={{ uri: `${APP_URL}/storage/images/restaurant/${restaurant.logo}` }}
                                style={{
                                    width: 54, height: 54,
                                    borderRadius: 27,
                                    backgroundColor: '#818F9C',
                                }}
                            />
                            <View style={{ flex: 1 }}>
                                <AppText weight="Bold" style={{ fontSize: 20, marginBottom: 6 }}>{delivery.name} {delivery.lastname}</AppText>
                                <AppText style={{ fontSize: 14, color: '#A0A5BA' }}>Delivery</AppText>
                            </View>
                            <TouchableOpacity onPress={() => Linking.openURL(`tel:${delivery.phone}`)}
                                style={{
                                    backgroundColor: '#FF4D4F',
                                    padding: 12,
                                    borderRadius: 24,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 8,
                                    elevation: 6
                                }}>
                                <Ionicons name="call-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    }
                </>}
            </Animated.View>
        </View>
    )
}

export default PendingOrder