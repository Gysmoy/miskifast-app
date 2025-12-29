import React, { useState } from 'react';
import JSEncrypt from 'jsencrypt';
import { PUBLIC_RSA_KEY } from '@/constants/settings';
import AuthRest from '@/src/data/AuthRest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';
import { useCart } from '@/src/context/CartContext';
import { applicationId } from 'expo-application';
import { modelName, brand } from 'expo-device';
import AuthContainer from '../../components/auth/auth-container';
import InputContainer from '../../components/forms/input-container';
import AuthButton from '../../components/auth/auth-button';

const authRest = new AuthRest()

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { loadIndex } = useCart()

    const jsEncrypt = new JSEncrypt()
    jsEncrypt.setPublicKey(PUBLIC_RSA_KEY)

    const onForgotPasswordSubmit = async () => {
        if (loading) return;
        setLoading(true);
        const result = await authRest.login({
            email: jsEncrypt.encrypt(email),
            password: jsEncrypt.encrypt(password),
            device_id: applicationId || 'unknown',
            device_name: `${brand} ${modelName}`.trim() || 'Desconocido',
        })
        if (!result) {
            Toast.show({
                type: 'error',
                text1: 'Error al iniciar sesión',
                text2: 'Credenciales incorrectas o problema de red',
                position: 'top',
                visibilityTime: 3000,
            });
            setLoading(false);
            return
        }
        await AsyncStorage.setItem('bearerToken', result.bearerToken);
        await AsyncStorage.setItem('session', JSON.stringify(result.user));
        await loadIndex()
        setLoading(false);
        router.replace('/');
    }

    return <AuthContainer title='Recupera tu acceso' description='Ingresa tu correo para recuperar tu cuenta.' showBack backHref={() => router.back()}>
        <InputContainer label='Correo electrónico' placeholder='example@email.com' keyboardType="email-address" value={email} setValue={setEmail} loaging={loading} />
        <AuthButton text='Enviar código' loading={loading} loadingText='Enviando...' onPress={onForgotPasswordSubmit} />
    </AuthContainer>
}