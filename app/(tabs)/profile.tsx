import AppHeader from "@/components/header";
import { apiClient } from "@/config/api";
import { useAuth } from "@/config/auth";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import { Avatar, Button, Card, Snackbar, Text, TextInput } from "react-native-paper";

interface UpdateUser {
    name: string | null;
    email: string | null;
    password: string | null;
}

export default function ProfileScreen() {
    const { user, profilePicture, refreshUser } = useAuth();
    const { logout } = useAuth();
    const [newName, setNewName] = useState<string>("");
    const [newEmail, setNewEmail] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");

    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const [visible, setVisible] = useState<boolean>(false);
    const [responseText, setResponseText] = useState<string>("");
    const [error, setError] = useState<string>("");

    const handleUpdate = async () => {
        if (!newName && !newEmail && !newPassword) {
            return;
        }
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
        refreshUser();
    };

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const handleUpdateProfilePicture = async () => {
        if (!selectedImage) return;

        const formDate = new FormData();
        formDate.append("file", {
            uri: selectedImage,
            name: "profilePicture.jpg",
            type: "image/jpeg",
        } as any);

        try {
            await apiClient(`users/profile-picture/${user.id}`, "PUT", formDate);
            setResponseText("Profile picture updated successfully.");
            setSelectedImage(null);
            setModalVisible(false);
        } catch (error) {
            setResponseText("Failed to update profile picture.");
            setError("Failed to update profile picture.");
        }
        setVisible(true);
        refreshUser();
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styleSheet.container}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}>
                <View style={styleSheet.centeredView}>
                    <View style={styleSheet.modalView}>
                        <Text style={styleSheet.modalTitle}>
                            Profile Picture
                        </Text>
                        <Text style={styleSheet.modalSubtitle}>
                            Choose a photo to personalize your account
                        </Text>
                        <Button
                            mode="outlined"
                            icon="image"
                            onPress={handlePickImage}
                            style={styleSheet.selectButton}
                        >
                            Choose Image
                        </Button>
                        <View style={styleSheet.previewContainer}>
                            {selectedImage ? (
                                <Image
                                    source={{ uri: selectedImage }}
                                    style={styleSheet.previewImage}
                                />
                            ) : (
                                <Avatar.Icon
                                    size={120}
                                    icon="account"
                                />
                            )}
                        </View>
                        <Button
                            mode="contained"
                            icon="check"
                            onPress={handleUpdateProfilePicture}
                            style={styleSheet.saveButton}
                            contentStyle={{
                                height: 52,
                            }}
                        >
                            Save Changes
                        </Button>
                        <Pressable
                            style={styleSheet.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={{ fontSize: 20 }}>
                                ✕
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
            <AppHeader title="Profile" />
            <View style={styleSheet.header}>
                <Pressable
                    onPress={() => setModalVisible(true)}>
                    <View style={styleSheet.avatarWrapper}>
                        {profilePicture && <Image source={{ uri: profilePicture.url }} style={styleSheet.avatarImage} />}
                        {!profilePicture && <Avatar.Text size={100} label={user?.name.split(" ")[0][0] + user?.name.split(" ")[1][0]} />}
                    </View>
                </Pressable>
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
        </KeyboardAvoidingView >
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
    saveButton: {
        width: "100%",
        marginTop: 16,
        borderRadius: 16,
        backgroundColor: "#6366F1",
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(15,23,42,0.65)",
    },
    modalView: {
        width: "88%",
        backgroundColor: "#FFF",
        borderRadius: 32,
        padding: 24,
        alignItems: "center",
        elevation: 20,
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    },
    buttonClose: {
        backgroundColor: "#6366F1",
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    closeButton: {
        position: "absolute",
        top: 18,
        right: 18,
        zIndex: 100,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#0F172A",
    },
    modalSubtitle: {
        marginTop: 8,
        textAlign: "center",
        color: "#64748B",
    },
    previewContainer: {
        marginTop: 24,
        marginBottom: 24,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: "#EEF2FF",
        justifyContent: "center",
        alignItems: "center",
    },

    previewImage: {
        width: 140,
        height: 140,
        borderRadius: 70,
    },
    selectButton: {
        width: "100%",
        borderRadius: 16,
    },
});