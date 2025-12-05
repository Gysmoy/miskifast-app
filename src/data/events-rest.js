import Fetch from "@/scripts/fetch";
import { APP_CORRELATIVE, APP_ENV, EVENTS_URL } from "../../constants/settings";

class EventsRest {
    emit = async (event, data, filters = {}) => {
        try {
            filters = filters || {};
            filters.environment = APP_ENV;

            const { status, result } = await Fetch(`${EVENTS_URL}/emit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    service: APP_CORRELATIVE,
                    filters,
                    eventType: event,
                    data
                })
            });

            if (!status) throw new Error('Ocurrió un error al notificar al cliente: ' + JSON.stringify(result));
            return true;
        } catch (th) {
            console.error(th.message);
            return false;
        }
    }
};

export default EventsRest;
