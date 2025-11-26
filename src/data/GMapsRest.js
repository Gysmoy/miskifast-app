import Fetch from "@/scripts/fetch";
import { GMAPS_API_KEY } from "../../constants/settings";

class GMapsRest {
    static cleanMapStyle = () => {
        return [
            // {
            //     "featureType": "poi",
            //     "elementType": "all",
            //     "stylers": [
            //         { "visibility": "off" }
            //     ]
            // },
            {
                "featureType": "poi.business",
                "elementType": "all",
                "stylers": [
                    { "visibility": "off" }
                ]
            },
            // {
            //     "featureType": "poi.government",
            //     "elementType": "all",
            //     "stylers": [
            //         { "visibility": "off" }
            //     ]
            // },
            // {
            //     "featureType": "poi.medical",
            //     "elementType": "all",
            //     "stylers": [
            //         { "visibility": "off" }
            //     ]
            // },
            // {
            //     "featureType": "poi.park",
            //     "elementType": "all",
            //     "stylers": [
            //         { "visibility": "off" }
            //     ]
            // },
            // {
            //     "featureType": "poi.place_of_worship",
            //     "elementType": "all",
            //     "stylers": [
            //         { "visibility": "off" }
            //     ]
            // },
            // {
            //     "featureType": "poi.school",
            //     "elementType": "all",
            //     "stylers": [
            //         { "visibility": "off" }
            //     ]
            // },
            // {
            //     "featureType": "poi.sports_complex",
            //     "elementType": "all",
            //     "stylers": [
            //         { "visibility": "off" }
            //     ]
            // },
            // {
            //     "featureType": "transit",
            //     "elementType": "all",
            //     "stylers": [
            //         { "visibility": "off" }
            //     ]
            // },
            // {
            //     "featureType": "administrative.land_parcel",
            //     "elementType": "all",
            //     "stylers": [
            //         { "visibility": "off" }
            //     ]
            // }
        ]
    }
    geocode = async (latitude, longitude) => {
        const { status, result } = await Fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GMAPS_API_KEY}`)

        if (!status || result.results.length == 0) return null

        const address = result.results[0];
        const components = address.address_components;
        const get = (type) => components.find(c => c.types.includes(type))?.long_name || '';

        return {
            department: get("administrative_area_level_1"),
            city: get("locality") || get("administrative_area_level_2"),
            district: get("sublocality") || get("administrative_area_level_3") || get("locality") || get("administrative_area_level_2"),
            street: get("route") || 'Sin dirección',
            number: get("street_number") || 'SN',
            address: address.formatted_address,
        }
    }

    routes = async (origin, destination) => {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=two_wheeler&key=${GMAPS_API_KEY}`
        const response = await fetch(url)
        const data = await response.json()
        return data.routes ?? []
    }
}

export default GMapsRest