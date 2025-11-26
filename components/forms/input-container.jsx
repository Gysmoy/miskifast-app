import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { Keyboard, TextInput, TouchableOpacity, View } from "react-native"
import AppText from "@/components/app-text"

const InputContainer = ({
    label,
    icon,
    type = 'text',
    keyboardType,
    style,
    value,
    setValue,
    placeholder,
    loading = false,
    disabled = false,
    readonly = false,
    multiline = false,
    numberOfLines = 2,
    autoFocus,
    onFocus = () => { },
    onBlur = () => { },
    onSearch = () => { },
}) => {
    const [showPassword, setShowPassword] = useState(false)

    const isPassword = type === 'password'
    const isSearch = type === 'search'

    return (
        <View style={{ flex: 1, marginRight: 8 }}>
            {label && (
                <AppText
                    weight="SemiBold"
                    style={{
                        fontSize: 14,
                        color: "#32343E",
                        marginBottom: 8,
                        letterSpacing: 0.5,
                        textTransform: "uppercase",
                    }}
                >
                    {label}
                </AppText>
            )}

            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#F6F6F6",
                    borderRadius: 12,
                }}
            >
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color="#999"
                        style={{ marginLeft: 16, marginRight: 8 }}
                    />
                )}

                <TextInput
                    autoFocus={autoFocus}
                    placeholder={placeholder}
                    placeholderTextColor="#979797"
                    value={value}
                    keyboardType={keyboardType}
                    returnKeyType={isSearch ? 'search' : 'done'}
                    onChangeText={setValue}
                    secureTextEntry={isPassword && !showPassword}
                    editable={!loading && !disabled && !readonly}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onSubmitEditing={(e) => {
                        if (isSearch) {
                            Keyboard.dismiss()
                            onSearch(e.nativeEvent.text)
                        }
                    }}
                    style={{
                        ...style,
                        fontFamily: "Sen-Regular",
                        height: !multiline ? 56 : 56 * numberOfLines - 24,
                        backgroundColor: "transparent",
                        flex: 1,
                        paddingHorizontal: icon ? 0 : 18,
                        paddingRight: isPassword || isSearch ? 48 : 18,
                        paddingTop: multiline ? 16 : undefined,
                        textAlignVertical: multiline ? "top" : "center",
                        fontSize: 16,
                        color: "#181C2E",
                        opacity: loading || disabled ? 0.6 : 1,
                    }}
                    multiline={multiline}
                    numberOfLines={multiline ? numberOfLines : undefined}
                />

                {/* 👇 Lógica del botón para mostrar/ocultar contraseña */}
                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={{
                            position: "absolute",
                            bottom: 16,
                            right: 0,
                            paddingHorizontal: 16,
                        }}
                        disabled={loading}
                    >
                        <Ionicons
                            name={showPassword ? "eye-off" : "eye"}
                            size={20}
                            color="#999"
                        />
                    </TouchableOpacity>
                )}

                {/* 👇 Lógica del botón para limpiar búsqueda */}
                {isSearch && value?.length > 0 && (
                    <TouchableOpacity
                        onPress={() => setValue("")}
                        style={{
                            position: "absolute",
                            bottom: 16,
                            right: 0,
                            paddingHorizontal: 16,
                        }}
                        disabled={loading}
                    >
                        <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}

export default InputContainer
