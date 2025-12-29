import { APP_URL } from "../../constants/settings";
import Fetch from '@/scripts/fetch'

class ItemsRest {
    all = async () => {
        const { status, result } = await Fetch(`${APP_URL}/app/items`)
        if (!status) return []
        return result?.data ?? []
    }

    bestSale = async () => {
        const { status, result, error } = await Fetch(`${APP_URL}/app/items/best-sale`)
        if (!status) return []
        return result?.data ?? []
    }

    search = async (query) => {
        const encodedQuery = encodeURIComponent(query)
        const { status, result } = await Fetch(`${APP_URL}/app/items?search=${encodedQuery}`)
        if (!status) return []
        return result?.data ?? []
    }

    byRestaurant = async (restaurantId) => {
        const { status, result } = await Fetch(`${APP_URL}/app/items/restaurant/${restaurantId}`)
        if (!status) return []
        return result?.data ?? []
    }
    byCategory = async (categoryId) => {
        const { status, result } = await Fetch(`${APP_URL}/app/items/category/${categoryId}`)
        if (!status) return []
        return result?.data ?? []
    }
    byRestaurantAndCategory = async (restaurantId, categoryId) => {
        const { status, result } = await Fetch(`${APP_URL}/app/items/restaurant/${restaurantId}/category/${categoryId}`)
        if (!status) return []
        return result?.data ?? []
    }
};

export default ItemsRest;