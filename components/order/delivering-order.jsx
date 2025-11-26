import React, { useEffect, useRef, useState } from "react"
import { View, Animated, Dimensions, TouchableOpacity, Linking } from "react-native"
import MapView, { Polyline } from "react-native-maps";
import AppText from "../app-text"
import { Image } from "react-native"
import { APP_URL, STORAGE_URL } from "@/constants/settings"
import AppMarker from "@/components/maps/app-marker"
import MarkRouteButton from "@/components/maps/mark-route-button"
import decodePolyline from '@/scripts/decode-polyline'
import GMapsRest from '@/src/data/GMapsRest'
import SimpleSkeleton from '@/components/skeleton/simple-skeleton'
import { Ionicons } from "@expo/vector-icons";
import OrdersRest from "@/src/data/OrdersRest";
import EventsRest from '@/src/data/events-rest';
import * as Location from 'expo-location';
import AppPolyline from "../maps/app-polyline";
import AppMapView from "@/components/maps/app-map-view"

const gMapsRest = new GMapsRest()
const ordersRest = new OrdersRest()
const eventsRest = new EventsRest()

const DeliveringOrder = ({ id: orderId, created_at, restaurant, status, delivery_latitude, delivery_longitude, delivery_status, client, details, statuses }) => {
    const [mainRoute, setMainRoute] = useState([]);
    const [altRoutes, setAltRoutes] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const bannerAnim = useRef(new Animated.Value(0)).current;
    const locationIntervalRef = useRef(null);
    const [userLocation, setUserLocation] = useState(null);

    const statusImage = `${STORAGE_URL}/status/${status?.image}`

    const isFilled = (stepId) => {
        const stepStatus = statuses.find(s => s.id === stepId);
        if (!stepStatus) return false;
        const currentStatus = stepStatus.type === 'order' ? status : delivery_status;
        return currentStatus && stepStatus.order <= currentStatus.order;
    };

    const onDeliveryStatusChange = async (statusId) => {
        const result = await ordersRest.deliveryStatus(orderId, statusId);
        if (!result) return;
    }

    // Request location permission and start watching position
    useEffect(() => {
        (async () => {
            let { status: locStatus } = await Location.requestForegroundPermissionsAsync();
            if (locStatus !== 'granted') {
                console.warn('Location permission not granted');
                return;
            }
            let location = await Location.getCurrentPositionAsync({});
            setUserLocation(location.coords);
        })();
    }, []);

    // Start sending location every 5s if delivery_status.id is one of the specified ones
    useEffect(() => {
        const targetStatusIds = [
            'a0618dce-5e6f-479c-af94-98a36ef6a6d6',
            'a0618dce-5fe8-4aa8-92c4-1797f9bc5618',
            'a0618dce-61c4-46b1-813e-338332d2d5de'
        ];

        if (targetStatusIds.includes(delivery_status?.id)) {
            locationIntervalRef.current = setInterval(async () => {
                try {
                    let location = await Location.getCurrentPositionAsync({});
                    setUserLocation(location.coords);
                    await eventsRest.emit('delivery_location', {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude
                    }, {
                        user_id: client.id,
                        mode: 'client'
                    });
                } catch (err) {
                    console.warn('Error sending location:', err);
                }
            }, 5000);
        } else {
            if (locationIntervalRef.current) {
                clearInterval(locationIntervalRef.current);
                locationIntervalRef.current = null;
                setUserLocation(null)
            }
        }

        return () => {
            if (locationIntervalRef.current) {
                clearInterval(locationIntervalRef.current);
                locationIntervalRef.current = null;
                setUserLocation(null)
            }
        };
    }, [delivery_status?.id]);

    useEffect(() => {
        const fetchRoute = async () => {
            try {
                let origin;
                if (delivery_status?.id === 'a0618dce-5e6f-479c-af94-98a36ef6a6d6' && userLocation) {
                    origin = userLocation;
                } else {
                    origin = {
                        latitude: restaurant.latitude,
                        longitude: restaurant.longitude
                    };
                }
                const routes = await gMapsRest.routes(
                    origin,
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
            (status?.id === 'f7b3f073-c8bf-49c9-ba6d-fcdfe82395dc' || (delivery_status?.id === 'a0618dce-5e6f-479c-af94-98a36ef6a6d6' && userLocation))
        ) {
            fetchRoute();
        }
    }, [restaurant, delivery_latitude, delivery_longitude, status, delivery_status?.id, userLocation]);

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
                {restaurant?.latitude && restaurant?.longitude && <AppMarker
                    latitude={restaurant.latitude}
                    longitude={restaurant.longitude}
                    title={restaurant.name}
                    color='#FF4D4F'
                    icon='restaurant'
                />}

                {/* Delivery (client) marker */}
                {delivery_latitude && delivery_longitude && <AppMarker
                    latitude={delivery_latitude}
                    longitude={delivery_longitude}
                    title='Entrega'
                    color='#10c469'
                    icon='home'
                />}

                {/* Delivery (delivery) marker */}
                {userLocation && <AppMarker
                    latitude={userLocation.latitude}
                    longitude={userLocation.longitude}
                    title='Entrega'
                    color='#71b6f9'
                    icon='bycicle'
                />}

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
                {
                    delivery_status.id == 'a0618dce-5d1b-4fae-a0bb-735d5c85270b' &&
                    <MarkRouteButton
                        onPress={() => onDeliveryStatusChange('a0618dce-5e6f-479c-af94-98a36ef6a6d6')}
                    >
                        Marcar ruta al restaurante
                    </MarkRouteButton>
                }
                {
                    delivery_status.id == 'a0618dce-5fe8-4aa8-92c4-1797f9bc5618' &&
                    <MarkRouteButton
                        onPress={() => onDeliveryStatusChange('a0618dce-61c4-46b1-813e-338332d2d5de')}
                    >
                        Marcar ruta al cliente
                    </MarkRouteButton>
                }
                {
                    delivery_status.id == 'a0618dce-61c4-46b1-813e-338332d2d5de' &&
                    <View style={{
                        position: 'absolute',
                        borderRadius: 12,
                        top: -54,
                        left: '50%',
                        transform: [{ translateX: '-50%' }],
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6
                    }}>
                        <TouchableOpacity style={{
                            backgroundColor: '#FF4D4F',
                            borderWidth: 1,
                            borderColor: '#FF4D4F',
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderRadius: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6
                        }}
                            onPress={() => onDeliveryStatusChange('a0618dce-62e9-4720-8e1f-10f3208c357e')}>
                            <Ionicons name='cube' size={16} color='#ffffff' />
                            <AppText style={{ fontSize: 14, color: '#ffffff', textTransform: 'uppercase' }}>Entregar</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity style={{
                            backgroundColor: '#ffffff',
                            borderWidth: 1,
                            borderColor: '#FF4D4F',
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderRadius: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6
                        }}
                            onPress={() => onDeliveryStatusChange('a0618dce-63fc-4e31-8a53-c6dd39ed54d3')}>
                            <Ionicons name='close' size={16} color='#FF4D4F' />
                            <AppText style={{ fontSize: 14, color: '#FF4D4F', textTransform: 'uppercase' }}>Cancelar</AppText>
                        </TouchableOpacity>
                    </View>
                }
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
                                    <View key={idx} style={{ flexDirection: 'row', marginBottom: 4, gap: 6, alignItems: 'flex-end' }}>
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
                    <View style={{
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
                            <AppText weight="Bold" style={{ fontSize: 20, marginBottom: 6 }}>{client.name} {client.lastname}</AppText>
                            <AppText style={{ fontSize: 14, color: '#A0A5BA' }}>Cliente</AppText>
                        </View>
                        <TouchableOpacity onPress={() => Linking.openURL(`tel:${client.phone}`)}
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
                </>}
            </Animated.View>
        </View>
    )
}

export default DeliveringOrder