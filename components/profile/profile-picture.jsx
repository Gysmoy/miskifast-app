import { Image, View } from "react-native"
import { STORAGE_URL } from "../../constants/settings"
import AppText from "../app-text"

const ProfilePicture = ({ profile, name, lastname, biography }) => {
    return <View
        style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 24,
            gap: 24
        }}
    >
        <Image
            source={{ uri: `${STORAGE_URL}/user/${profile}` }}
            style={{ width: 100, height: 100, backgroundColor: 'rgba(230, 57, 70, .2)', borderRadius: 50 }}
            contentFit="cover"
            contentPosition="center"
        />
        <View style={{ flexShrink: 1 }}>
            <AppText weight='Bold' style={{ fontSize: 20, color: '#32343E', marginBottom: 5 }} numberOfLines={1} ellipsizeMode='tail'>
                {name} {lastname}
            </AppText>
            <AppText
                numberOfLines={3}
                ellipsizeMode='tail'
                style={{
                    fontSize: 14,
                    color: '#A0A5BA',
                    flexWrap: 'wrap'
                }}
            >
                {biography || 'Sin biografía'}
            </AppText>
        </View>
    </View>
}

export default ProfilePicture