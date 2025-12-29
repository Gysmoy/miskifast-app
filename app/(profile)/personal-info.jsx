import AppText from "@/components/app-text";
import { ScrollView, View, TouchableOpacity} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AuthRest from "@/src/data/AuthRest";
import { useState } from "react";
import { router } from "expo-router";
import { useCart } from '@/src/context/CartContext';
import MenuContainer from "../../components/menu/menu-container";
import { Image } from "expo-image";
import { STORAGE_URL } from "../../constants/settings";
import InputContainer from "../../components/forms/input-container";
import AuthButton from "../../components/auth/auth-button";
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfilePicture from "../../components/profile/profile-picture";

const authRest = new AuthRest()

export default function PersonalInfoScreen() {
    const [isEditing, setIsEditing] = useState(false)

    const { session, setSession } = useCart();

    const [name, setName] = useState(session.name)
    const [lastname, setLastname] = useState(session.lastname)
    const [email, setEmail] = useState(session.email)
    const [phone, setPhone] = useState(session.phone)
    const [biography, setBiography] = useState(session.biography)
    const [saving, setSaving] = useState(false)
    const [profileBase64, setProfileBase64] = useState(null)
    const [profilePreview, setProfilePreview] = useState(null)

    const data = [
        { icon: 'person-outline', color: '#FB6F3D', title: 'Nombre', data: `${session.name} ${session.lastname}` },
        { icon: 'mail-outline', color: '#413DFB', title: 'Correo electrónico', data: session.email },
        { icon: 'call-outline', color: '#369BFF', title: 'Teléfono celular', data: session.phone },
    ];

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
            base64: true
        });

        if (!result.canceled) {
            const manipResult = await ImageManipulator.manipulateAsync(
                result.assets[0].uri,
                [{ resize: { width: 512, height: 512 } }],
                { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
            );
            setProfilePreview(manipResult.uri);
            setProfileBase64(manipResult.base64);
        }
    };

    const onProfileSubmit = async () => {
        setSaving(true)
        const payload = {
            name,
            lastname,
            email,
            phone,
            biography,
            ...(profileBase64 && { profile: profileBase64 })
        };

        const result = await authRest.updateProfile(payload)
        setSaving(false)
        console.log(result)
        if (!result) return
        await AsyncStorage.setItem('session', JSON.stringify(result));
        setSession(result)
        setIsEditing(false)
        setProfilePreview(null)
        setProfileBase64(null)
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 24, gap: 12 }}>
                <TouchableOpacity
                    onPress={() => isEditing ? setIsEditing(false) : router.back()}
                    style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, padding: 8 }}
                >
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <AppText style={{ fontSize: 17, color: '#181C2E', flex: 1 }}>{isEditing ? 'Editar perfil' : 'Información Personal'}</AppText>
                {
                    !isEditing &&
                    <TouchableOpacity onPress={() => setIsEditing(true)} >
                        <AppText style={{ color: '#FF3B30', fontSize: 14, textTransform: 'uppercase', borderBottom: '1px solid #FF3B30' }}>EDITAR</AppText>
                    </TouchableOpacity>
                }
            </View>


            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}>
                {
                    isEditing
                        ? <View style={{ gap: 24 }}>
                            <View style={{ alignItems: 'center', position: 'relative', marginBottom: 24 }}>
                                <Image
                                    source={profilePreview ? { uri: profilePreview } : { uri: `${STORAGE_URL}/user/${session.profile}` }}
                                    style={{
                                        backgroundColor: 'rgba(230, 57, 70, .2)',
                                        width: 150, height: 150,
                                        borderRadius: 75, marginHorizontal: 'auto'
                                    }}
                                    contentFit='cover'
                                    contentPosition='center'
                                />
                                <TouchableOpacity
                                    onPress={pickImage}
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: '50%',
                                        transform: 'translateX(25%)',
                                        backgroundColor: '#FF4D4F',
                                        borderRadius: 24,
                                        padding: 8,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 4,
                                        elevation: 4,
                                    }}
                                >
                                    <Ionicons name="pencil" size={24} color="#ffffff" />
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <InputContainer label='Nombre' placeholder='John' value={name} setValue={setName} readonly={saving} />
                                <InputContainer label='Apellido' placeholder='Doe' value={lastname} setValue={setLastname} readonly={saving} />
                            </View>
                            <InputContainer label='Email' placeholder='example@email.com' value={email} setValue={setEmail} readonly={true} />
                            <InputContainer label='Teléfono celular' placeholder='912345678' value={phone} setValue={setPhone} readonly={saving} keyboardType='phone-pad' />
                            <InputContainer label='Biografía' placeholder='Cuéntanos sobre ti...' value={biography} setValue={setBiography} readonly={saving} multiline numberOfLines={2} style={{ height: 80, textAlignVertical: 'top' }} />
                            <AuthButton text='Guardar' loading={saving} loadingText='Guardando...' onPress={onProfileSubmit} />
                        </View>
                        : <>
                            <ProfilePicture {...session} />
                            <MenuContainer>
                                {
                                    data.map(item => <View
                                        key={item.icon}
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            paddingHorizontal: 24,
                                            paddingVertical: 12,
                                            gap: 18
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
                                            <Ionicons name={item.icon} size={20} color={item.color} />
                                            <View>
                                                <AppText style={{ fontSize: 14, color: '#32343E', textTransform: 'uppercase' }}>
                                                    {item.title}
                                                </AppText>
                                                <AppText style={{ fontSize: 14, color: '#6B6E82' }}>
                                                    {item.data}
                                                </AppText>
                                            </View>
                                        </View>
                                    </View>)
                                }
                            </MenuContainer>
                        </>
                }
            </ScrollView>
        </View>
    )
}