import Fetch from "@/scripts/fetch";
import { APP_URL } from "../../constants/settings";

class PaymentMethodsRest {
    all = async () => {
        const {status, result } = await Fetch(`${APP_URL}/app/payment-methods`)
        if (!status) return null
        return result?.data ?? null
    }
};

export default PaymentMethodsRest;