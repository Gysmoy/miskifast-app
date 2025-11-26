import Fetch from "@/scripts/fetch";
import { APP_URL } from "../../constants/settings";

class CategoriesRest {
    all = async () => {
        const { status, result } = await Fetch(`${APP_URL}/app/categories`);
        if (!status) return null
        return result?.data ?? null
    }
};

export default CategoriesRest;