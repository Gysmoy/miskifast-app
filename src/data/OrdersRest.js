import Toast from "react-native-toast-message";
import { APP_URL } from "../../constants/settings";
import Fetch from '@/scripts/fetch'

class OrdersRest {
    save = async (request) => {
        const { status, result } = await Fetch(`${APP_URL}/app/orders`, {
            method: 'POST',
            body: JSON.stringify(request)
        })
        if (!status) {
            Toast.show({
                text1Style: {
                    fontFamily: 'Sen-Bold',
                    fontSize: 15
                },
                text2Style: {
                    fontFamily: 'Sen-Regular',
                    fontSize: 13
                },
                type: 'error',
                text1: 'Error al procesar el pedido',
                text2: result?.message ?? 'Ocurrió un error inesperado',
                position: 'top',
            });
            return null
        }
        return result?.data ?? null
    }

    paginate = async (request) => {
        const { status, result } = await Fetch(`${APP_URL}/app/orders/paginate`, {
            method: 'POST',
            body: JSON.stringify(request)
        });
        if (!status) return null
        return result.data
    }

    deliver = async (orderId) => {
        const { status, result } = await Fetch(`${APP_URL}/app/orders/deliver/${orderId}`)
        if (!status) {
            Toast.show({
                text1Style: {
                    fontFamily: 'Sen-Bold',
                    fontSize: 15
                },
                text2Style: {
                    fontFamily: 'Sen-Regular',
                    fontSize: 13
                },
                type: 'error',
                text1: 'Error al tomar la orden',
                text2: result?.message ?? 'Ocurrió un error al intentar tomar la orden',
                position: 'top',
            });
            return null
        }
        return result?.data ?? true
    }

    deliveryStatus = async (request) => {
        const { status, result } = await Fetch(`${APP_URL}/app/orders/delivery-status`, {
            method: 'PATCH',
            body: JSON.stringify(request)
        })
        if (!status) {
            Toast.show({
                text1Style: {
                    fontFamily: 'Sen-Bold',
                    fontSize: 15
                },
                text2Style: {
                    fontFamily: 'Sen-Regular',
                    fontSize: 13
                },
                type: 'error',
                text1: 'Error al tomar la orden',
                text2: result?.message ?? 'Ocurrió un error al intentar tomar la orden',
                position: 'top',
            });
            return null
        }
        return result?.data ?? true
    }

    last = async (mode) => {
        const { status, result } = await Fetch(`${APP_URL}/app/orders/last${mode ? `/${mode}` : ''}`);
        if (!status) return null
        return result?.data ?? null
    }

    available = async () => {
        const { status, result } = await Fetch(`${APP_URL}/app/orders/available`);
        if (!status) return null
        return result?.data ?? null
    }
};

export default OrdersRest;