import AppText from "../../components/app-text";
import { ScrollView, View, TouchableOpacity, Alert, RefreshControl, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState, useRef } from "react";
import { router } from "expo-router";
import * as Location from 'expo-location';
import AuthButton from "../../components/auth/auth-button";
import AddressesRest from "../../src/data/AddressesRest";
import AppMarker from "../../components/maps/app-marker";
import InputContainer from "../../components/forms/input-container";
import Toast from "react-native-toast-message";
import GMapsRest from "../../src/data/GMapsRest";
import RadioContainer from "../../components/forms/radio-container";
import AddressTags from "../../src/data/AddresTags";
import AddressContainer from "../../components/profile/address-container";
import AddressSkeleton from "../../components/skeleton/address-skeleton";

import clientMarker from '@/assets/images/client-marker.png'
import MapView from "react-native-maps";

const addressesRest = new AddressesRest()
const gMapsRest = new GMapsRest()
const addressTags = new AddressTags()

export default function AddressesScreen() {
    const isMounted = useRef(true);
    const [addresses, setAddresses] = useState([])
    const [refreshing, setRefreshing] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [loading, setLoading] = useState(true);

    const [region, setRegion] = useState({
        latitude: -13.15878,
        longitude: -74.22321,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });
    const [coordinate, setCoordinate] = useState(null);
    const [form, setForm] = useState({
        name: '',
        department: '',
        city: '',
        district: '',
        street: '',
        number: '',
        reference: '',
        latitude: '',
        longitude: '',
        is_default: false,
    });

    useEffect(() => {
        return () => { isMounted.current = false };
    }, []);

    const getAddresses = async () => {
        try {
            setLoading(true);
            const result = await addressesRest.all()
            if (isMounted.current) {
                setLoading(false);
                setAddresses(result ?? [])
            }
        } catch {
            if (isMounted.current) {
                setLoading(false);
                setAddresses([]);
            }
        }
    }

    useEffect(() => {
        getAddresses()
    }, [])

    const onRefresh = async () => {
        setRefreshing(true)
        await getAddresses()
        if (isMounted.current) setRefreshing(false)
    }

    const onMapPress = async (e) => {
        try {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            if (!isMounted.current) return;
            setCoordinate({ latitude, longitude });
            setForm(prev => ({
                ...prev,
                latitude: latitude.toString(),
                longitude: longitude.toString(),
            }));

            const result = await gMapsRest.geocode(latitude, longitude)
            if (!isMounted.current) return;
            if (!result) {
                Toast.show({
                    type: 'error',
                    text1: 'No se pudo obtener la dirección',
                    text2: 'Intenta otro lugar o vuelve a intentar más tarde',
                    position: 'bottom',
                });
                return
            }
            setForm(prev => ({ ...prev, ...result }));
        } catch {
            if (isMounted.current) {
                Toast.show({
                    type: 'error',
                    text1: 'Error al obtener dirección',
                    position: 'bottom',
                });
            }
        }
    };

    const handleInputChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setForm({
            name: '',
            department: '',
            city: '',
            district: '',
            street: '',
            number: '',
            reference: '',
            latitude: '',
            longitude: '',
            is_default: false,
        });
        setCoordinate(null);
        setRegion({
            latitude: -13.15878,
            longitude: -74.22321,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        });
    };

    const handleAddressForm = async (address = null) => {
        if (address) {
            setEditingId(address.id);
            setForm({
                name: address.name,
                department: address.department,
                city: address.city,
                district: address.district,
                street: address.street,
                number: address.number,
                reference: address.reference,
                latitude: address.latitude.toString(),
                longitude: address.longitude.toString(),
                is_default: address.is_default,
                tag: address.tag,
            });
            setCoordinate({
                latitude: parseFloat(address.latitude),
                longitude: parseFloat(address.longitude),
            });
            setRegion({
                latitude: parseFloat(address.latitude),
                longitude: parseFloat(address.longitude),
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
        } else {
            setEditingId(null);
            resetForm();
        }
        setIsEditing(true);
    };

    const handleSave = async () => {
        const requiredFields = [
            { key: 'name', label: 'Nombre' },
            { key: 'department', label: 'Departamento' },
            { key: 'city', label: 'Ciudad' },
            { key: 'district', label: 'Distrito' },
            { key: 'street', label: 'Calle' },
            { key: 'number', label: 'Número' },
            { key: 'tag', label: 'Etiqueta' }
        ];

        const missing = requiredFields.filter(f => !form[f.key]).map(f => f.label);
        if (!coordinate) missing.push('Ubicación');

        if (missing.length) {
            Alert.alert(
                'Campos incompletos',
                `Por favor completa: ${missing.join(', ')}`
            );
            return;
        }

        const payload = { ...form };
        if (editingId) payload.id = editingId;

        try {
            const result = await addressesRest.save(payload);
            if (!result) return;
            if (!isMounted.current) return;
            Alert.alert('Éxito', editingId ? 'Dirección actualizada' : 'Dirección guardada');
            setIsEditing(false);
            onRefresh();
        } catch {
            if (isMounted.current) {
                Alert.alert('Error', 'No se pudo guardar la dirección');
            }
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            'Eliminar dirección',
            'Esta acción es irreversible. ¿Deseas continuar?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        try {
                            const success = await addressesRest.delete(id);
                            if (success && isMounted.current) {
                                Toast.show({
                                    type: 'success',
                                    text1: 'Dirección eliminada',
                                    position: 'bottom',
                                });
                                onRefresh();
                            }
                        } catch {
                            if (isMounted.current) {
                                Toast.show({
                                    type: 'error',
                                    text1: 'Error al eliminar',
                                    position: 'bottom',
                                });
                            }
                        }
                    },
                },
            ]
        );
    };

    const handleLocationPress = async () => {
        try {
            let { status } = await Location.getForegroundPermissionsAsync();
            if (status !== 'granted') {
                const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
                if (newStatus !== 'granted') {
                    Toast.show({
                        type: 'error',
                        text1: 'Permisos requeridos',
                        text2: 'Debes otorgar permisos de ubicación para usar esta función.',
                        position: 'top',
                    });
                    return;
                }
            }

            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
                timeInterval: 5000,
                distanceInterval: 10,
            });
            if (!isMounted.current) return;
            const { latitude, longitude } = location.coords;
            setCoordinate({ latitude, longitude });
            setRegion({
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
            setForm(prev => ({
                ...prev,
                latitude: latitude.toString(),
                longitude: longitude.toString(),
            }));

            const result = await gMapsRest.geocode(latitude, longitude)
            if (!isMounted.current) return;
            if (!result) return;
            setForm(prev => ({ ...prev, ...result }));
        } catch {
            if (isMounted.current) {
                Toast.show({
                    type: 'error',
                    text1: 'Error al obtener ubicación',
                    position: 'bottom',
                });
            }
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            {
                isEditing
                    ? <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                        <View style={{ position: 'absolute', top: 24, left: 24, zIndex: 10 }}>
                            <TouchableOpacity
                                onPress={() => setIsEditing(false)}
                                style={{ backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 8 }}
                            >
                                <Ionicons name="chevron-back" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <View style={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>
                            <TouchableOpacity
                                onPress={handleLocationPress}
                                style={{ backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 8 }}
                            >
                                <Ionicons name="locate" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <MapView
                            style={{ width: '100%', aspectRatio: 75 / 59 }}
                            customMapStyle={GMapsRest.cleanMapStyle()}
                            // region={region}
                            // onRegionChangeComplete={setRegion}
                            onPress={onMapPress}
                        >
                            {coordinate && <AppMarker
                                latitude={coordinate.latitude}
                                longitude={coordinate.longitude}
                                color='#10c469'
                                icon={clientMarker}
                            />}
                        </MapView>

                        <View style={{ padding: 24, gap: 24 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <Ionicons name="location" size={20} color="#FF4D4F" />
                                <AppText style={{ fontSize: 16, color: '#32343E' }}>
                                    Selecciona un punto en el mapa para registrar tu dirección
                                </AppText>
                            </View>
                            <InputContainer label='Dirección' value={`${form.street || 'SD'} ${form.number || 'SN'}, ${form.district}, ${form.city}, ${form.department}`} multiline numberOfLines={2} readonly={true} />
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <InputContainer label='Departamento' value={form.department} readonly />
                                <InputContainer label='Ciudad' value={form.city} readonly />
                            </View>
                            <InputContainer label='Distrito' value={form.district} readonly />
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <View style={{ flex: 0.7 }}>
                                    <InputContainer label='Calle' value={form.street || 'SD'} readonly />
                                </View>
                                <View style={{ flex: 0.3 }}>
                                    <InputContainer label='Número' value={form.number || 'SN'} readonly />
                                </View>
                            </View>
                            <InputContainer label='Referencia' value={form.reference} setValue={v => handleInputChange('reference', v)} multiline numberOfLines={2} />
                            <InputContainer label='Nombre de dirección' placeholder='Ej. Mi casa, El trabajo, Casa de Manuel' value={form.name} setValue={v => handleInputChange('name', v)} />
                            <RadioContainer
                                label='Etiquetar como'
                                value={form.tag}
                                setValue={v => handleInputChange('tag', v)}
                                options={addressTags.all().map(({ id: value, icon, pretty }) => ({ value, label: <><Ionicons name={icon} /> {pretty}</> }))}
                                uppercase />

                            <AuthButton text={editingId ? "Actualizar dirección" : "Guardar dirección"} onPress={handleSave} />
                        </View>
                    </ScrollView>
                    : <>
                        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 24, gap: 12 }}>
                            <TouchableOpacity
                                onPress={() => router.back()}
                                style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, padding: 8 }}
                            >
                                <Ionicons name="chevron-back" size={24} color="#fff" />
                            </TouchableOpacity>
                            <AppText style={{ fontSize: 17, color: '#181C2E', flex: 1 }}>Mis direcciones</AppText>
                        </View>

                        <ScrollView
                            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, gap: 24 }}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                            }
                        >
                            {
                                loading
                                    ? <AddressSkeleton />
                                    : addresses.map(address => (
                                        <AddressContainer
                                            key={address.id}
                                            {...address}
                                            onEdit={() => handleAddressForm(address)}
                                            onDelete={() => handleDelete(address.id)}
                                        />
                                    ))

                            }
                            <AuthButton text='Agregar dirección' onPress={() => handleAddressForm()} />
                        </ScrollView>
                    </>
            }
        </View>
    )
}
