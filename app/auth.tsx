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
                <Text style={styleSheet.title} variant="headlineLarge">{isSignUp ? "Create an account" : "Welcome back"}</Text>

                <TextInput {...(!isSignUp && { disabled: true })}
                    label="Name"
                    autoCapitalize="none"
                    placeholder="Name"
                    mode="outlined"
                    style={styleSheet.input}
                    onChangeText={setName}
                />

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

                {error && <Text style={{ color: theme.colors.error, marginTop: 5 }}>{error}</Text>}

                <Button
                    mode="contained"
                    style={styleSheet.button}
                    onPress={handleAuth}
                >
                    {isSignUp ? "Sign Up" : "Login"}
                </Button>
                <Button mode="text" onPress={handleSwitchMode}>{isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}</Button>
            </View>
        </KeyboardAvoidingView>
    );
}

const styleSheet = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5"
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
        marginTop: 16
    },
    button: {
        marginTop: 16
    },
});