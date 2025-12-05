import { useEffect, useState } from 'react';
import { View, TouchableOpacity, Modal } from 'react-native';
import JSEncrypt from 'jsencrypt';
import { PUBLIC_RSA_KEY } from '@/constants/settings';
import AuthRest from '@/src/data/AuthRest';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { useCart } from '@/src/context/CartContext';
import { applicationId } from 'expo-application';
import { modelName, brand } from 'expo-device';
import AuthContainer from '../../components/auth/auth-container';
import InputContainer from '../../components/forms/input-container';
import AuthButton from '../../components/auth/auth-button';
import AppText from "@/components/app-text"
import { registerPushToken } from '../../scripts/register-push-token';
import { Ionicons } from '@expo/vector-icons';

const authRest = new AuthRest()

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModeModal, setShowModeModal] = useState(false);

    const [pushToken, setPushToken] = useState(null)
    const [countdown, setCountdown] = useState(5);

    const { loadIndex, setAppMode } = useCart()

    const jsEncrypt = new JSEncrypt()
    jsEncrypt.setPublicKey(PUBLIC_RSA_KEY)

    const handleModeSelection = async (mode) => {
        setShowModeModal(false);
        setAppMode(mode);
        await loadIndex();
        setLoading(false);
        router.replace('/');
    };

    const onLoginSubmit = async () => {
        if (loading) return;
        setLoading(true);
        const result = await authRest.login({
            email: jsEncrypt.encrypt(email),
            password: jsEncrypt.encrypt(password),
            device_id: applicationId || 'unknown',
            device_name: `${brand} ${modelName}`.trim() || 'Desconocido',
        })
        if (!result) {
            setLoading(false);
            return
        }
        await SecureStore.setItemAsync('bearerToken', result.bearerToken);
        await SecureStore.setItemAsync('session', JSON.stringify(result.user));
        const isDelivery = result.user.roles.some(role => role.name === 'Delivery')
        if (isDelivery) {
            setAppMode('Delivery')
            setShowModeModal(true);
            setCountdown(5);
        } else {
            setAppMode('Client')
            await loadIndex()
            setLoading(false);
            router.replace('/');
        }
    }

    useEffect(() => {
        registerPushToken().then(token => setPushToken(token))
    }, [null])

    useEffect(() => {
        if (!showModeModal) return;
        if (countdown === 0) {
            handleModeSelection('Delivery');
            return;
        }
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [showModeModal, countdown]);

    console.log('pushToken:', pushToken)

    return (
        <>
            <AuthContainer title='Iniciar sesión' description='Inicia sesión en una cuenta existente' showBack={false}>
                <InputContainer label='Correo electrónico' placeholder='example@email.com' keyboardType="email-address" value={email} setValue={setEmail} loaging={loading} />
                <InputContainer label='Contraseña' placeholder='•••••' type='password' value={password} setValue={setPassword} loaging={loading} />
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                }}>
                    <TouchableOpacity disabled={loading} onPress={() => router.push('/(auth)/forgot-password')}>
                        <AppText style={{ fontSize: 14, color: '#FF4D4F', opacity: loading ? 0.6 : 1 }}>
                            ¿Olvidaste tu contraseña?
                        </AppText>
                    </TouchableOpacity>
                </View>
                <AuthButton text='Iniciar sesión' loading={loading} loadingText='Verificando...' onPress={onLoginSubmit} />
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                }}>
                    <AppText style={{ fontSize: 16, color: '#666' }}>
                        ¿No tienes una cuenta?
                    </AppText>
                    <TouchableOpacity disabled={loading} onPress={() => router.push('/(auth)/register')} style={{
                        marginLeft: 12
                    }}>
                        <AppText style={{ fontSize: 16, color: '#FF4D4F', fontWeight: 'bold', opacity: loading ? 0.6 : 1 }}>
                            REGÍSTRATE
                        </AppText>
                    </TouchableOpacity>
                </View>
            </AuthContainer>

            <Modal
                transparent
                animationType="slide"
                visible={showModeModal}
                onRequestClose={() => handleModeSelection('Client')}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }} onPress={() => handleModeSelection('Delivery')}>
                    <View style={{ backgroundColor: '#fff', borderRadius: 16, paddingVertical: 24, paddingHorizontal: 24, alignItems: 'center' }}>
                        <AppText style={{ fontSize: 20, marginBottom: 24, fontWeight: '600', color: '#333', textAlign: 'center' }}>
                            ¿Cómo te gustaría continuar?
                        </AppText>

                        <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                            <TouchableOpacity
                                style={{ flex: 1, backgroundColor: '#FF4D4F', paddingVertical: 14, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                                onPress={() => handleModeSelection('Delivery')}
                            >
                                <Ionicons name='bicycle' size={16} color="#fff" />
                                <AppText weight='Bold' style={{ color: '#fff', fontSize: 16 }}>Delivery</AppText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ flex: 1, backgroundColor: '#FF4D4F', paddingVertical: 14, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                                onPress={() => handleModeSelection('Client')}
                            >
                                <Ionicons name='person' size={16} color="#fff" />
                                <AppText weight='Bold' style={{ color: '#fff', fontSize: 16 }}>Cliente</AppText>
                            </TouchableOpacity>
                        </View>

                        <AppText style={{ marginTop: 16, fontSize: 14, color: '#666' }}>
                            Iniciando como delivery {countdown}s
                        </AppText>
                    </View>
                </View>
            </Modal>
        </>
    );
}