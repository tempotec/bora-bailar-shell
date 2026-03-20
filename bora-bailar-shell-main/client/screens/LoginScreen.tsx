/**
 * LoginScreen - Email and Password login
 */
import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    ActivityIndicator,
    Alert,
    Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useAuth } from "@/contexts/AuthContext";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const { signIn } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const isValidEmail = (text: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(text);
    };

    const isFormValid = isValidEmail(email) && password.length >= 6;

    const handleLogin = async () => {
        if (!isFormValid) return;

        setError(null);
        setIsLoading(true);

        try {
            await signIn(email.trim(), password);

            // Navigate to main screen and reset stack
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: "Main" }],
                })
            );
        } catch (err: any) {
            const message = err.message || "Erro ao fazer login";
            setError(message);

            if (Platform.OS === "web") {
                window.alert(message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = useCallback(() => {
        const message = "Funcionalidade de recuperação de senha em desenvolvimento.";
        if (Platform.OS === "web") {
            window.alert(message);
        } else {
            Alert.alert("Em breve", message);
        }
    }, []);

    const handleGoToRegister = useCallback(() => {
        navigation.navigate("RegisterStep1");
    }, [navigation]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={handleGoBack}>
                    <Feather name="chevron-left" size={28} color={Colors.dark.text} />
                </Pressable>

                <View style={styles.headerCenter}>
                    <Text style={styles.headerBrandName}>
                        <Text style={styles.brandRed}>B</Text>
                        <Text style={styles.brandGray}>ORABAILAR</Text>
                    </Text>
                </View>

                <View style={styles.placeholder} />
            </View>

            <KeyboardAwareScrollViewCompat
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: insets.bottom + Spacing.xl },
                ]}
            >
                <View style={styles.iconWrapper}>
                    <View style={styles.iconContainer}>
                        <Feather name="log-in" size={32} color={Colors.dark.brand} />
                    </View>
                </View>

                <Text style={styles.title}>Entrar</Text>
                <Text style={styles.subtitle}>
                    Bem-vindo de volta!{"\n"}Entre com seu e-mail e senha.
                </Text>

                {error && (
                    <View style={styles.errorContainer}>
                        <Feather name="alert-circle" size={16} color="#D32F2F" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>E-mail</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="seu@email.com"
                        placeholderTextColor={Colors.dark.textSecondary}
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            setError(null);
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!isLoading}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Senha</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Sua senha"
                            placeholderTextColor={Colors.dark.textSecondary}
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                setError(null);
                            }}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!isLoading}
                        />
                        <Pressable
                            style={styles.eyeButton}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Feather
                                name={showPassword ? "eye-off" : "eye"}
                                size={20}
                                color={Colors.dark.textSecondary}
                            />
                        </Pressable>
                    </View>
                </View>

                <Pressable style={styles.forgotButton} onPress={handleForgotPassword}>
                    <Text style={styles.forgotText}>Esqueceu a senha?</Text>
                </Pressable>

                <View style={styles.spacer} />

                <Pressable
                    style={[
                        styles.loginButton,
                        !isFormValid && styles.loginButtonDisabled,
                    ]}
                    onPress={handleLogin}
                    disabled={!isFormValid || isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.loginButtonText}>Entrar</Text>
                    )}
                </Pressable>

                <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>Não tem uma conta? </Text>
                    <Pressable onPress={handleGoToRegister}>
                        <Text style={styles.registerLink}>Cadastre-se</Text>
                    </Pressable>
                </View>
            </KeyboardAwareScrollViewCompat>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
    backButton: {
        padding: Spacing.xs,
    },
    headerCenter: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerBrandName: {
        fontSize: 18,
        letterSpacing: 1,
    },
    brandRed: {
        color: Colors.dark.brand,
        fontWeight: "700",
    },
    brandGray: {
        color: Colors.dark.textSecondary,
        fontWeight: "400",
    },
    placeholder: {
        width: 36,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xl * 2,
        flexGrow: 1,
    },
    iconWrapper: {
        alignItems: "center",
        marginBottom: Spacing.lg,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#FFF0F0",
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: Colors.dark.text,
        textAlign: "center",
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: 15,
        color: Colors.dark.textSecondary,
        textAlign: "center",
        lineHeight: 22,
        marginBottom: Spacing.xl,
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFEBEE",
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.lg,
        gap: Spacing.sm,
    },
    errorText: {
        color: "#D32F2F",
        fontSize: 14,
        flex: 1,
    },
    inputContainer: {
        marginBottom: Spacing.md,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "500",
        color: Colors.dark.text,
        marginBottom: Spacing.xs,
    },
    input: {
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        fontSize: 16,
        color: Colors.dark.text,
        backgroundColor: "#FFFFFF",
    },
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: BorderRadius.md,
        backgroundColor: "#FFFFFF",
    },
    passwordInput: {
        flex: 1,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        fontSize: 16,
        color: Colors.dark.text,
    },
    eyeButton: {
        padding: Spacing.md,
    },
    forgotButton: {
        alignSelf: "flex-end",
        marginTop: Spacing.xs,
    },
    forgotText: {
        fontSize: 14,
        color: Colors.dark.brand,
        fontWeight: "500",
    },
    spacer: {
        flex: 1,
        minHeight: Spacing.xl * 2,
    },
    loginButton: {
        backgroundColor: Colors.dark.brand,
        borderRadius: BorderRadius.xl,
        paddingVertical: Spacing.md + 2,
        alignItems: "center",
        marginTop: Spacing.lg,
    },
    loginButtonDisabled: {
        backgroundColor: "#E0E0E0",
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    registerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: Spacing.lg,
    },
    registerText: {
        fontSize: 14,
        color: Colors.dark.textSecondary,
    },
    registerLink: {
        fontSize: 14,
        color: Colors.dark.brand,
        fontWeight: "600",
    },
});
