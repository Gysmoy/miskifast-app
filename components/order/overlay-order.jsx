import { Image, View } from "react-native"
import AppText from "../app-text"
import AuthButton from "../auth/auth-button"
import { useCart } from "@/src/context/CartContext"
import { useEffect, useState } from "react"

const OverlayOrder = ({ image, title, description, specification = '', countDown = null }) => {
    const { setLastPendingOrder } = useCart()
    const [remaining, setRemaining] = useState(countDown)

    useEffect(() => {
        if (countDown === null) return
        setRemaining(countDown)
        const interval = setInterval(() => {
            setRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(interval)
                    // Defer the state update to avoid setState during render
                    setTimeout(() => setLastPendingOrder(null), 0)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [countDown])

    return <View style={{ flex: 1, backgroundColor: "#fff", padding: 24 }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Image
                source={image}
                style={{
                    width: 150,
                    height: 150,
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.35,
                    shadowRadius: 12,
                    elevation: 12
                }}
                contentFit="cover"
                contentPosition="center"
            />
            <AppText weight='Bold' style={{ fontSize: 24, color: "#374151", marginTop: 24, marginBottom: 12 }}>{title}</AppText>
            <AppText style={{ fontSize: 14, color: "#525c67", textAlign: "center" }}>
                {description}
            </AppText>
            {
                specification && <AppText style={{ fontSize: 14, color: "#525c67", textAlign: "center", marginTop: 6 }}>
                    Motivo: {specification}
                </AppText>
            }
            <AuthButton text='Cerrar' onPress={() => setLastPendingOrder(null)} />
            {countDown !== null && (
                <AppText style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
                    Cerrando en {remaining}s...
                </AppText>
            )}
        </View>
    </View>
}

export default OverlayOrder