import Fetch from "@/scripts/fetch";
import { APP_URL } from "../../constants/settings";

class AddressesRest {
    all = async () => {
        const { status, result } = await Fetch(`${APP_URL}/app/addresses`)
        if (!status) return null
        return result?.data ?? null
    }

    save = async (request) => {
        const { status } = await Fetch(`${APP_URL}/app/addresses`, {
            method: 'POST',
            body: JSON.stringify(request)
        })
        if (!status) return false
        return true
    }

    delete = async (addressId) => {
        const { status } = await Fetch(`${APP_URL}/app/addresses/${addressId}`, {
            method: 'DELETE'
        })
        return status
    }
};

export default AddressesRest;