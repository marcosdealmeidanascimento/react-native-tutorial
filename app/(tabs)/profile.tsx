import { apiClient } from "@/config/api";
import { useAuth } from "@/config/auth";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Avatar, Button, Card, Snackbar, Text, TextInput } from "react-native-paper";

interface UpdateUser {
    name: string | null;
    email: string | null;
    password: string | null;
}

export default function ProfileScreen() {
    const { user } = useAuth();
    const { logout } = useAuth();
    const [newName, setNewName] = useState<string>("");
    const [newEmail, setNewEmail] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");

    const [visible, setVisible] = useState(false);
    const [responseText, setResponseText] = useState<string>("");
    const [error, setError] = useState<string>("");


    const handleUpdate = async () => {
        let newUser: UpdateUser = { name: newName ? newName : user.name, email: newEmail ? newEmail : user.email, password: null };

        if (newPassword) {
            newUser.password = newPassword;
        }

        try {
            await apiClient(`users/${user.id}`, "PUT", newUser);
            setResponseText("Profile updated successfully.");
        } catch (error) {
            setResponseText("Failed to update profile.");
            setError("Failed to update profile.");
        }
        setVisible(true);
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styleSheet.container}>
            <View style={styleSheet.header}>
                <Avatar.Text size={75} label={user?.name.split(" ")[0][0] + user?.name.split(" ")[1][0]} style={styleSheet.avatar} />
                <Text style={{ marginRight: 16, fontWeight: "bold", fontSize: 24 }}>{user?.name}</Text>
                <Text>{user?.email}</Text>
            </View>
            <View>
                <Card mode="elevated" style={styleSheet.card}>
                    <Card.Content>
                        <Text variant="bodyMedium">In this section you can see your profile. You can update your profile information</Text>
                    </Card.Content>
                </Card>
            </View>
            <View style={styleSheet.content}>
                <TextInput mode="outlined" label="Name" placeholder="Enter your name" onChangeText={setNewName} />
                <TextInput mode="outlined" label="Email" keyboardType="email-address" placeholder="Enter your email" onChangeText={setNewEmail} autoCapitalize="none" />
                <TextInput mode="outlined" label="Password" secureTextEntry placeholder="Enter your password" onChangeText={setNewPassword} />
                <Button mode="contained" style={styleSheet.button} onPress={handleUpdate}>Update</Button>
            </View>
            <Snackbar visible={visible} action={{ label: "Close", onPress: () => { } }} onDismiss={() => setVisible(false)} >{responseText}</Snackbar>
            <View style={{ marginBottom: 16, alignItems: "center" }}>
                <Button onPress={logout} icon="logout">Logout</Button>
            </View>
        </KeyboardAvoidingView>
    );
}

const styleSheet = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        width: "95%",
        alignSelf: "center"
    },
    content: {
        flex: 1,
        padding: 16,
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
    card: {
        marginTop: 16,
        backgroundColor: "#f5f5f5"
    },
    header: {
        alignItems: "center",
        marginTop: 16,
        flexDirection: "row",
    },
    avatar: {
        marginRight: 16
    }
});