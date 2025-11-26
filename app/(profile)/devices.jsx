import AppText from "../../components/app-text";
import { ScrollView, View, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AuthRest from "../../src/data/AuthRest";
import { useEffect, useState } from "react";
import { router } from "expo-router";

const authRest = new AuthRest()

export default function DevicesScreen() {

    const [devices, setDevices] = useState([])
    const [refreshing, setRefreshing] = useState(false)
    const [loading, setLoading] = useState(true)

    const getDevices = async () => {
        const result = await authRest.devices()
        if (result && result.length) setDevices(result)
        setLoading(false)
    }

    useEffect(() => {
        getDevices()
    }, [])

    const onRefresh = async () => {
        setRefreshing(true)
        await getDevices()
        setRefreshing(false)
    }

    const formatLastUsed = (iso) => {
        const d = new Date(iso)
        const now = new Date()
        const diffMs = now - d
        const diffMins = Math.floor(diffMs / 60000)
        if (diffMins < 1) return 'Ahora'
        if (diffMins < 60) return `Hace ${diffMins} min`
        const diffHrs = Math.floor(diffMins / 60)
        if (diffHrs < 24) return `Hace ${diffHrs} h`
        const diffDays = Math.floor(diffHrs / 24)
        return `Hace ${diffDays} d`
    }

    const handleLogoutDevice = (id) => {
        Alert.alert('Cerrar sesión', '¿Cerrar sesión en este dispositivo?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Cerrar',
                onPress: async () => {
                    await authRest.logoutDevice(id)
                    getDevices()
                },
            },
        ])
    }

    const handleLogoutAll = async () => {
        Alert.alert('Cerrar todas', '¿Cerrar sesión en todos los dispositivos?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Cerrar',
                onPress: async () => {
                    await authRest.logoutAllDevices()
                    getDevices()
                },
            },
        ])
    }

    const handleLogoutOthers = async () => {
        Alert.alert('Cerrar otros', '¿Cerrar sesión en todos excepto este?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Cerrar',
                onPress: async () => {
                    await authRest.logoutOtherDevices()
                    getDevices()
                },
            },
        ])
    }

    const SkeletonItem = () => (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F8F8F8',
                borderRadius: 12,
                padding: 18,
                marginBottom: 12,
            }}
        >
            <View style={{ width: 24, height: 24, backgroundColor: '#e0e0e0', borderRadius: 4, marginRight: 12 }} />
            <View style={{ flex: 1 }}>
                <View style={{ width: '60%', height: 15, backgroundColor: '#e0e0e0', borderRadius: 4, marginBottom: 4 }} />
                <View style={{ width: '40%', height: 13, backgroundColor: '#e0e0e0', borderRadius: 4, marginBottom: 2 }} />
                <View style={{ width: '50%', height: 12, backgroundColor: '#e0e0e0', borderRadius: 4 }} />
            </View>
            <View style={{ width: 28, height: 28, backgroundColor: '#e0e0e0', borderRadius: 4 }} />
        </View>
    )

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 24, gap: 12 }}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, padding: 8 }}
                >
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <AppText style={{ fontSize: 17, color: '#181C2E', flex: 1 }}>Dispositivos ({devices.length || 1})</AppText>
                <TouchableOpacity
                    onPress={handleLogoutAll}
                    style={{ backgroundColor: '#FF3B30', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 }}
                >
                    <AppText style={{ color: '#fff', fontSize: 13 }}>Cerrar todas</AppText>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {loading ? (
                    <>
                        <SkeletonItem />
                        <SkeletonItem />
                        <SkeletonItem />
                    </>
                ) : (
                    devices.map((d) => (
                        <View
                            key={d.id}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: d.current ? '#E8F5E9' : '#F8F8F8',
                                borderRadius: 12,
                                padding: 18,
                                marginBottom: 12,
                            }}
                        >
                            <Ionicons name="phone-portrait" size={24} color={d.current ? '#2E7D32' : '#181C2E'} style={{ marginRight: 12 }} />
                            <View style={{ flex: 1 }}>
                                <AppText style={{ fontSize: 15, color: d.current ? '#2E7D32' : '#181C2E', marginBottom: 2 }}>{d.device_name}</AppText>
                                <AppText style={{ fontSize: 13, color: '#666' }}>{d.ip_address}</AppText>
                                <AppText style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Última vez: {formatLastUsed(d.last_used_at)}</AppText>
                            </View>
                            {!d.current && (
                                <TouchableOpacity
                                    onPress={() => handleLogoutDevice(d.id)}
                                    style={{ backgroundColor: '#FF3B30', borderRadius: 20, padding: 6 }}
                                >
                                    <Ionicons name="log-out-outline" size={20} color="#fff" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    )
}