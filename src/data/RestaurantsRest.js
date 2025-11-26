import Fetch from "@/scripts/fetch";
import { APP_URL } from "../../constants/settings";

class RestaurantsRest {
    all = async () => {
        const { status, result } = await Fetch(`${APP_URL}/app/restaurants`)
        if (!status) return null
        return result?.data ?? null
    }

    byCategory = async (categoryId) => {
        const { status, result } = await Fetch(`${APP_URL}/app/restaurants/category/${categoryId}`)
        if (!status) return null
        return result?.data ?? null
    }
};

export default RestaurantsRest;
