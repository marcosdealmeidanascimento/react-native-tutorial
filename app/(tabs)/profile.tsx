import AppHeader from "@/components/header";
import { apiClient } from "@/config/api";
import { useAuth } from "@/config/auth";
import { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Avatar, Button, Card, Snackbar, Text, TextInput } from "react-native-paper";

interface UpdateUser {
    name: string | null;
    email: string | null;
    password: string | null;
}

export default function ProfileScreen() {
    const { user, profilePicture } = useAuth();
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
            <AppHeader title="Profile" />
            <View style={styleSheet.header}>
                <View style={styleSheet.avatarWrapper}>
                    {profilePicture && <Image source={{ uri: profilePicture.url }} style={styleSheet.avatarImage} />}
                    {!profilePicture && <Avatar.Text size={100} label={user?.name.split(" ")[0][0] + user?.name.split(" ")[1][0]} />}
                </View>
                <Text style={{ marginRight: 16, fontWeight: "bold", fontSize: 24 }}>{user?.name}</Text>
                <Text>{user?.email}</Text>
            </View>
            <View>
                <Card mode="elevated" style={styleSheet.infoCard}>
                    <Card.Content>
                        <Text variant="bodyMedium">In this section you can see your profile. You can update your profile information</Text>
                    </Card.Content>
                </Card>
            </View>
            <View style={styleSheet.content}>
                <TextInput mode="outlined" label="Name" placeholder="Enter your name" onChangeText={setNewName} />
                <TextInput mode="outlined" label="Email" keyboardType="email-address" placeholder="Enter your email" onChangeText={setNewEmail} autoCapitalize="none" />
                <TextInput mode="outlined" label="Password" secureTextEntry placeholder="Enter your password" onChangeText={setNewPassword} />
                <Button mode="contained" style={styleSheet.button} onPress={handleUpdate}>Save changes</Button>
            </View>
            <Snackbar visible={visible} action={{ label: "Close", onPress: () => { } }} onDismiss={() => setVisible(false)} >{responseText}</Snackbar>
            <View style={styleSheet.loggoutContainer}>
                <Button textColor="#EF4444" onPress={logout} icon="logout">Logout</Button>
            </View>
        </KeyboardAvoidingView>
    );
}

const styleSheet = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        width: "95%",
        alignSelf: "center"
    },
    content: {
        flex: 1,
        gap: 16,
        padding: 16,
    },
    title: {
        textAlign: "center"
    },
    input: {
        marginTop: 16
    },
    button: {
        marginTop: 16,
        borderRadius: 16,
    },
    header: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 24,
        marginBottom: 24,
    },
    avatarWrapper: {
        padding: 8,
        borderRadius: 60,
        backgroundColor: "#EEF2FF",
        marginBottom: 16,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    infoCard: {
        borderRadius: 20,
        marginTop: 16,
        marginHorizontal: 16,
        backgroundColor: "#fff",
    },
    loggoutContainer: {
        marginBottom: 24,
        alignItems: "center",
    },
});