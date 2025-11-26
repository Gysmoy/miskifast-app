import { useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
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

const authRest = new AuthRest()

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const [pushToken, setPushToken] = useState(null)

    const { loadIndex, setAppMode } = useCart()

    const jsEncrypt = new JSEncrypt()
    jsEncrypt.setPublicKey(PUBLIC_RSA_KEY)

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
        setAppMode('Client')

        await loadIndex()
        setLoading(false);
        router.replace('/');
    }

    useEffect(() => {
        registerPushToken().then(token => setPushToken(token))
    }, [null])

    console.log('pushToken:', pushToken)

    return <AuthContainer title='Iniciar sesión' description='Inicia sesión en una cuenta existente' showBack={false}>
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
}