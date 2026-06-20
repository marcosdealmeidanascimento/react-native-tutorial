import Logo from "@/components/logo";
import { apiClient } from "@/config/api";
import { useAuth } from "@/config/auth";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";

export default function authScreen() {
    const [isSignUp, setIsSignUp] = useState<boolean>(false);
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const theme = useTheme();

    const { login } = useAuth();

    const handleSwitchMode = () => {
        setIsSignUp((prev: boolean) => !prev);

        setError("");
        setName("");
        setEmail("");
        setPassword("");
    };

    const handleAuth = async () => {
        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        try {
            if (isSignUp) {
                await apiClient("users", "POST", { name, email, password });
                setIsSignUp(false);
                return;
            } else {
                await login(email, password);

            }
        } catch (error: any) {
            setError("Login ou senha inválidos.");
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styleSheet.container}>
            <View style={styleSheet.content}>
                <View style={styleSheet.logoContainer}>
                    <Logo width={120} height={120} />
                    <Text variant="headlineMedium" style={styleSheet.title}>
                        Finance Dashboard
                    </Text>
                    <Text
                        variant="bodyMedium"
                        style={styleSheet.subtitle}
                    >
                        Track your finances with confidence
                    </Text>
                </View>
                {/* <Text style={styleSheet.title} variant="headlineLarge">{isSignUp ? "Create an account" : "Welcome back"}</Text> */}
                <View style={styleSheet.formCard}>
                    {isSignUp && (
                        <TextInput
                            label="Name"
                            autoCapitalize="words"
                            placeholder="Your name"
                            mode="outlined"
                            style={styleSheet.input}
                            value={name}
                            onChangeText={setName}
                        />
                    )}

                    <TextInput
                        label="Email"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholder="example@gmail.com"
                        mode="outlined"
                        style={styleSheet.input}
                        onChangeText={setEmail}
                    />

                    <TextInput
                        label="Password"
                        secureTextEntry
                        mode="outlined"
                        placeholder="Password"
                        autoCapitalize="none"
                        style={styleSheet.input}
                        onChangeText={setPassword}
                    />
                    {error && <View style={styleSheet.errorContainer}>
                        <Text style={styleSheet.errorText}>
                            {error}
                        </Text>
                    </View>}
                    <Button
                        mode="contained"
                        style={styleSheet.button}
                        contentStyle={{
                            height: 56,
                        }}
                        onPress={handleAuth}
                    >
                        {isSignUp ? "Sign Up" : "Login"}
                    </Button>
                    <Button style={styleSheet.button} mode="text" onPress={handleSwitchMode}>{isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}</Button>
                </View>

            </View>
        </KeyboardAvoidingView>
    );
}

const styleSheet = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC"
    },
    content: {
        flex: 1,
        padding: 16,
        justifyContent: "center"
    },
    title: {
        textAlign: "center"
    },
    input: {
        marginTop: 20,
        backgroundColor: "#fff",
    },
    button: {
        marginTop: 16
    },
    logoContainer: {
        alignItems: "center",
        marginTop: 16
    },
    subtitle: {
        marginTop: 8,
        opacity: 0.6,
        textAlign: "center"
    },
    formCard: {
        backgroundColor: "#fff",
        padding: 24,
        marginTop: 32,
        elevation: 8,
        borderRadius: 16,
    },
    form: {
        marginTop: 32,
    },
    errorContainer: {
        marginTop: 16,
    },
    errorText: {
        color: "red",
        textAlign: "center",
    },
    signUpContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 16
    }
});