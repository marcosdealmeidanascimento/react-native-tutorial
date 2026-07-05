import { apiClient } from "@/config/api";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    View,
} from "react-native";
import { Button, Text } from "react-native-paper";
import PaymentForm from "./PaymentForm";

interface Props {
    visible: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export default function CreatePaymentModal({
    visible,
    onClose,
    onCreated,
}: Props) {
    const [saving, setSaving] = useState(false);
    const [payment, setPayment] = useState({
        description: "",
        amount: 0,
        dueDate: "",
        recurring: false,
        method: "PIX",
    });

    const handleCreate = async () => {
        try {
            setSaving(true);

            await apiClient("payment", "POST", payment);

            onCreated();
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
        >
            <View style={styles.overlay}>
                <View style={styles.container}>

                    <View style={styles.header}>
                        <Text style={styles.title}>
                            New payment
                        </Text>

                        <Pressable onPress={onClose}>
                            <Feather
                                name="x"
                                size={24}
                                color="#1E293B"
                            />
                        </Pressable>
                    </View>

                    <PaymentForm
                        payment={payment}
                        setPayment={setPayment}
                    />
                    <Button
                        mode="contained"
                        icon="content-save"
                        loading={saving}
                        style={{ marginTop: 24 }}
                        onPress={() => {
                            handleCreate();
                        }}
                    >
                        Save
                    </Button>
                    <Button
                        style={{ marginTop: 12 }}
                        onPress={() => {
                            setSaving(false);
                        }}
                    >
                        Cancel
                    </Button>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,.45)",
        justifyContent: "flex-end",
    },

    container: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        maxHeight: "90%",
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },

    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#1E293B",
    },
});