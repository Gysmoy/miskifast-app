import Fetch from "@/scripts/fetch";
import { APP_URL } from "../../constants/settings";

class FavoritesRest {
    isFavorite = async (itemId) => {
        const { status, result } = await Fetch(`${APP_URL}/app/favorites/${itemId}`, {
            method: 'GET',
        })
        if (!status) return false
        return result.data ?? null
    }

    toggle = async (request) => {
        const { status, result } = await Fetch(`${APP_URL}/app/favorites`, {
            method: 'POST',
            body: JSON.stringify(request)
        })
        if (!status) return false
        return result.data ?? null
    }

    paginate = async (request) => {
        const { status, result } = await Fetch(`${APP_URL}/app/favorites/paginate`, {
            method: 'POST',
            body: JSON.stringify(request)
        });
        if (!status) return null
        return result.data
    }
};

export default FavoritesRest;
