import { apiClient } from "@/config/api";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { Button, Chip, Divider, Text } from "react-native-paper";
import PaymentForm from "./PaymentForm";
interface Props {
    visible: boolean;
    paymentId: number | null;
    onClose: () => void;
    onUpdate?: () => void;
}

export default function PaymentModal({
    visible,
    paymentId,
    onClose,
    onUpdate,
}: Props) {
    const [payment, setPayment] = useState<any>(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const paid = payment?.status === "PAID";
    const pending = payment?.status === "PENDING";
    const failed = payment?.status === "FAILED";
    const cancelled = payment?.status === "CANCELLED";

    const colors =
        paid
            ? ["#0f766e", "#14b8a6"]
            : pending
                ? ["#fbbf24", "#f59e0b"]
                : failed
                    ? ["#b6b6b6", "#a3a3a3"]
                    : cancelled
                        ? ["#f87171", "#ef4444"]
                        : ["#312e81", "#6366f1"];

    useEffect(() => {
        if (!visible || paymentId == null) return;

        async function loadPayment() {
            const response = await apiClient(`payment/${paymentId}`);
            setPayment(response);
        }

        loadPayment();
    }, [visible, paymentId]);

    const handleSave = async () => {
        var payload = {
            description: payment.description,
            amount: payment.amount,
            dueDate: payment.dueDate,
            recurring: payment.recurring,
            method: payment.method,
        };

        try {
            setSaving(true);
            await apiClient(`payment/${payment.id}`, "PUT", payload);
            setEditing(false);
            onClose();
        } catch (error) {
            console.log(error);
        } finally {
            setSaving(false);
            onUpdate?.();
        }
    };

    const handleDelete = async () => {
        try {
            setSaving(true);
            await apiClient(`payment/${payment.id}`, "DELETE", {});
            onClose();
        } catch (error) {
            console.log(error);
        } finally {
            setSaving(false);
            onUpdate?.();
        }
    };

    const handleCancel = async () => {
        try {
            setSaving(true);
            await apiClient(`payment/mark-cancelled/${payment.id}`, "POST", {});
            onClose();
        } catch (error) {
            console.log(error);
        } finally {
            setSaving(false);
            onUpdate?.();
        }
    };

    const handlePay = async () => {
        try {
            setSaving(true);
            await apiClient(`payment/mark-paid/${payment.id}`, "POST", {});
            onClose();
        } catch (error) {
            console.log(error);
        } finally {
            setSaving(false);
            onUpdate?.();
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

                    <LinearGradient
                        colors={colors}
                        style={styles.header}
                    >
                        <View style={styles.closeRow}>
                            <Text style={styles.title}>
                                Payment details
                            </Text>

                            <Pressable onPress={onClose}>
                                <Feather
                                    name="x"
                                    size={24}
                                    color="#fff"
                                />
                            </Pressable>
                        </View>

                        <Text style={styles.amount}>
                            ${Number(payment?.amount).toFixed(2)}
                        </Text>

                        <Chip
                            style={styles.chip}
                            textStyle={{ color: "#fff" }}
                        >
                            {payment?.status}
                        </Chip>
                    </LinearGradient>

                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                    >

                        <Text style={styles.label}>Description</Text>
                        <Text style={styles.value}>
                            {payment?.description}
                        </Text>

                        <Divider style={styles.divider} />

                        <Text style={styles.label}>Due date</Text>
                        <Text style={styles.value}>
                            {payment?.dueDate}
                        </Text>

                        <Divider style={styles.divider} />

                        <Text style={styles.label}>Payment method</Text>
                        <Text style={styles.value}>
                            {payment?.method}
                        </Text>

                        <Divider style={styles.divider} />

                        <Text style={styles.label}>Recurring</Text>
                        <Text style={styles.value}>
                            {payment?.recurring ? "Yes" : "No"}
                        </Text>

                        <Divider style={styles.divider} />

                        {editing ? (
                            <>
                                <PaymentForm
                                    payment={payment}
                                    setPayment={setPayment}
                                />

                                <Button
                                    mode="contained"
                                    icon="content-save"
                                    loading={saving}
                                    style={{ marginTop: 24 }}
                                    onPress={handleSave}
                                >
                                    Save
                                </Button>

                                <Button
                                    style={{ marginTop: 12 }}
                                    onPress={() => {
                                        setEditing(false);
                                    }}
                                >
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <>
                                {pending && (
                                    <Button
                                        mode="contained"
                                        icon="check"
                                        style={{ marginTop: 30 }}
                                        onPress={() => handlePay()}
                                    >
                                        Mark as paid
                                    </Button>
                                )}
                                {pending && (
                                    <Button
                                        mode="contained"
                                        icon="pencil"
                                        style={{ marginTop: 12 }}
                                        onPress={() => setEditing(true)}
                                    >
                                        Edit payment
                                    </Button>
                                )}

                                {pending && (
                                    <Button
                                        mode="outlined"
                                        icon="close"
                                        textColor="#DC2626"
                                        style={{ marginTop: 12 }}
                                        onPress={() => handleCancel()}
                                    >
                                        Cancel payment
                                    </Button>
                                )}

                                {!paid && (
                                    <Button
                                        mode="outlined"
                                        icon="delete"
                                        textColor="#DC2626"
                                        style={{ marginTop: 12 }}
                                        onPress={() => handleDelete()}
                                    >
                                        Delete payment
                                    </Button>
                                )}
                            </>
                        )}

                    </ScrollView>

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
        overflow: "hidden",
        
    },

    header: {
        padding: 24,
    },

    closeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    title: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "700",
    },

    amount: {
        marginTop: 24,
        color: "#fff",
        fontSize: 42,
        fontWeight: "900",
    },

    chip: {
        alignSelf: "flex-start",
        marginTop: 20,
        backgroundColor: "rgba(255,255,255,.2)",
    },

    content: {
        padding: 24,
    },

    label: {
        color: "#94A3B8",
        fontSize: 13,
        textTransform: "uppercase",
        letterSpacing: 1,
    },

    value: {
        fontSize: 18,
        fontWeight: "700",
        marginTop: 6,
        color: "#1E293B",
    },

    divider: {
        marginVertical: 18,
    },
});