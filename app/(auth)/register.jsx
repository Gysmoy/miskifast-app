import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import JSEncrypt from 'jsencrypt';
import { PUBLIC_RSA_KEY } from '@/constants/settings';
import AuthRest from '@/src/data/AuthRest';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';
import { useCart } from '@/src/context/CartContext';
import { applicationId } from 'expo-application';
import { modelName, brand } from 'expo-device';
import InputContainer from '@/components/forms/input-container';
import AuthContainer from '@/components/auth/auth-container';
import AuthButton from '@/components/auth/auth-button';
import AppText from "@/components/app-text"

const authRest = new AuthRest()

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [prefix, setPrefix] = useState('+51'); // default Peru prefix
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const [duplicateUser, setDuplicateUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const { loadIndex } = useCart()

    const jsEncrypt = new JSEncrypt()
    jsEncrypt.setPublicKey(PUBLIC_RSA_KEY)

    const onRegisterSubmit = async () => {
        if (loading) return;
        if (password !== confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Las contraseñas no coinciden',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }
        setLoading(true);
        const user = await authRest.validateDuplicate({ email })
        console.log(user)
        if (user) {
            setDuplicateUser(user);
            setShowModal(true);
            setLoading(false);
            return;
        }
        await performRegister(false);
    }

    const performRegister = async (update) => {
        setLoading(true);
        const result = await authRest.register({
            name, lastname, phone, email,
            password: jsEncrypt.encrypt(password),
            device_id: applicationId || 'unknown',
            device_name: `${brand} ${modelName}`.trim() || 'Desconocido',
            update
        })
        if (!result) {
            setLoading(false)
            return
        }

        await SecureStore.setItemAsync('bearerToken', result.bearerToken);
        await SecureStore.setItemAsync('session', JSON.stringify(result.user));
        await loadIndex()
        setLoading(false);
        router.replace('/');
    }

    const handleModalChoice = (useFormData) => {
        setShowModal(false);
        if (useFormData === null) return; // user closed modal
        if (duplicateUser && 
            name === duplicateUser.name && 
            lastname === duplicateUser.lastname && 
            phone === duplicateUser.phone) {
            // data identical, proceed with update false
            performRegister(false);
        } else {
            performRegister(useFormData);
        }
    }

    const renderModal = () => {
        if (!duplicateUser) return null;
        const sameData = name === duplicateUser.name && 
                         lastname === duplicateUser.lastname && 
                         phone === duplicateUser.phone;
        return (
            <Modal transparent visible={showModal} animationType="fade" onRequestClose={() => handleModalChoice(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <AppText weight="Bold" style={styles.modalTitle}>Conflicto</AppText>
                        <AppText style={styles.modalSubtitle}>El usuario ya está registrado como trabajador. ¿Deseas continuar con el registro como cliente?</AppText>

                        {!sameData && (
                            <>
                                <View style={styles.box}>
                                    <AppText weight="Bold" style={styles.boxTitle}>Datos del formulario</AppText>
                                    <AppText>Nombre: {name}</AppText>
                                    <AppText>Apellido: {lastname}</AppText>
                                    <AppText>Teléfono: {phone}</AppText>
                                </View>
                                <View style={styles.box}>
                                    <AppText weight="Bold" style={styles.boxTitle}>Datos de la validación</AppText>
                                    <AppText>Nombre: {duplicateUser.name}</AppText>
                                    <AppText>Apellido: {duplicateUser.lastname}</AppText>
                                    <AppText>Teléfono: {duplicateUser.phone}</AppText>
                                </View>
                            </>
                        )}

                        <View style={styles.buttonsRow}>
                            {!sameData && (
                                <>
                                    <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => handleModalChoice(true)}>
                                        <AppText weight="Bold" style={styles.buttonTextSecondary}>Usar datos del formulario</AppText>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={() => handleModalChoice(false)}>
                                        <AppText weight="Bold" style={styles.buttonTextPrimary}>Usar datos de la validación</AppText>
                                    </TouchableOpacity>
                                </>
                            )}
                            {sameData && (
                                <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={() => handleModalChoice(false)}>
                                    <AppText weight="Bold" style={styles.buttonTextPrimary}>Continuar con el registro</AppText>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }

    return (
        <>
            <AuthContainer title='Regístrate' description='Crea tu cuenta para comenzar' showBack backHref={() => router.back()}>
                {/* Nombre y Apellido en fila */}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <InputContainer label='Nombre' placeholder='John' value={name} setValue={setName} loading={loading} />
                    <InputContainer label='Apellido' placeholder='Doe' value={lastname} setValue={setLastname} loading={loading} />
                </View>

                <InputContainer label='Email' placeholder='example@email.com' value={email} setValue={setEmail} loading={loading} />

                <InputContainer
                    label='Teléfono celular'
                    placeholder='912345678'
                    value={phone}
                    setValue={setPhone}
                    loading={loading}
                    keyboardType='phone-pad'
                />

                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <InputContainer label='Contraseña' placeholder='•••••' type='password' value={password} setValue={setPassword} loading={loading} />
                    <InputContainer label='Confirmación' placeholder='•••••' type='password' value={confirmPassword} setValue={setConfirmPassword} loading={loading} />
                </View>

                <AuthButton text='Regístrate' loading={loading} loadingText='Registrando...' onPress={onRegisterSubmit} />

                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginBottom: 24,
                }}>
                    <AppText style={{ fontSize: 16, color: '#666' }}>
                        ¿Ya tienes una cuenta?
                    </AppText>
                    <TouchableOpacity disabled={loading} onPress={() => router.back()} style={{
                        marginLeft: 12
                    }}>
                        <AppText weight='Bold' style={{ fontSize: 16, color: '#FF4D4F', opacity: loading ? 0.6 : 1 }}>
                            INICIA SESIÓN
                        </AppText>
                    </TouchableOpacity>
                </View>
            </AuthContainer>
            {renderModal()}
        </>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        width: '100%',
        maxWidth: 400
    },
    modalTitle: {
        fontSize: 20,
        marginBottom: 8,
        textAlign: 'center'
    },
    modalSubtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
        textAlign: 'center'
    },
    box: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12
    },
    boxTitle: {
        marginBottom: 4
    },
    buttonsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonPrimary: {
        backgroundColor: '#FF4D4F'
    },
    buttonSecondary: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#FF4D4F'
    },
    buttonTextPrimary: {
        color: '#fff'
    },
    buttonTextSecondary: {
        color: '#FF4D4F'
    }
});
