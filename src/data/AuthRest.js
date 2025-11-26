import Toast from "react-native-toast-message";
import { APP_URL } from "../../constants/settings";
import Fetch from "@/scripts/fetch";

class AuthRest {
    login = async (request) => {
        const { status, result } = await Fetch(`${APP_URL}/app/login`, {
            method: 'POST',
            body: JSON.stringify(request)
        })
        if (!status) {
            Toast.show({
                type: 'error',
                text1: 'Error al iniciar sesión',
                text2: result?.message ?? 'Credenciales incorrectas o problema de red',
                position: 'top',
                visibilityTime: 3000,
            });
            return null
        }
        return result?.data ?? null
    }

    register = async (request) => {
        const { status, result } = await Fetch(`${APP_URL}/app/register`, {
            method: 'POST',
            body: JSON.stringify(request)
        })
        if (!status) {
            Toast.show({
                type: 'error',
                text1: 'Error al registrarse',
                text2: result?.message ?? 'Verifica los datos o problema de red',
                position: 'top',
                visibilityTime: 3000,
            });
            return null
        }
        return result?.data ?? null
    }

    validateDuplicate = async (request) => {
        const { result } = await Fetch(`${APP_URL}/app/register`, {
            method: 'POST',
            body: JSON.stringify(request)
        })
        return result?.data ?? null
    }

    verify = async () => {
        const { status, result } = await Fetch(`${APP_URL}/app/auth/verify`)
        if (!status) return null
        return result?.data ?? null
    }

    updateProfile = async (request) => {
        const { status, result } = await Fetch(`${APP_URL}/app/auth/profile`, {
            method: 'PATCH',
            body: JSON.stringify(request)
        });
        if (!status) return null;
        return result?.data ?? null;
    }

    devices = async () => {
        const { status, result } = await Fetch(`${APP_URL}/app/auth/devices`);
        if (!status) return []
        return result?.data ?? []
    }

    logout = async (all) => {
        const { status } = await Fetch(`${APP_URL}/app/auth/logout${all ? '-all' : ''}`, {
            method: 'DELETE'
        })
        return status
    }
};

export default AuthRest;