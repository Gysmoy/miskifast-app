import AsyncStorage from '@react-native-async-storage/async-storage';

const parseable = (text) => {
    try {
        let json = JSON.parse(text);
        return json;
    } catch (error) {
        return false;
    }
};

const Fetch = async (url, options = {}) => {
    const { method = 'GET', headers = {}, body, ...params } = options;
    const start = performance.now();

    try {
        headers['Content-Type'] = headers['Content-Type'] ?? 'application/json'
        headers.Accept = headers.Accept ?? 'application/json'

        const bearerToken = await AsyncStorage.getItem('bearerToken');
        if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`

        const res = await fetch(url, { method, headers, body, ...params })
        
        const raw = await res.text()
        const result = parseable(raw) || raw

        if (!res.ok) {
            const end = performance.now();
            const elapsed = Math.round(end - start);
            console.error(`${method} ${url} ${elapsed}ms → ${result?.message ?? 'Error inesperado'}`)
            return { status: false, result }
        }
        const end = performance.now();
        const elapsed = Math.round(end - start);
        console.info(`${method} ${url} ${elapsed}ms → ${result?.message ?? 'Operación correcta'} ${result.data?.length ? `[${result.data.length} registros]` : ''}`.trim())
        return { status: true, result }
    } catch (error) {
        const end = performance.now();
        const elapsed = Math.round(end - start);
        console.error(`${method} ${url} ${elapsed}ms → ${error.message}`)
        return { status: false, error }
    }
}

export default Fetch