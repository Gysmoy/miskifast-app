import Fetch from "@/scripts/fetch";
import { APP_URL } from "../../constants/settings";

class StatusesRest {
    all = async () => {
        const { status, result } = await Fetch(`${APP_URL}/app/statuses`);
        if (!status) return null
        return result?.data ?? null
    }
}

export default StatusesRest