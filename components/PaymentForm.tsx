import { StyleSheet, View } from "react-native";
import { Switch, Text, TextInput } from "react-native-paper";

interface Props {
    payment: any;
    setPayment: React.Dispatch<React.SetStateAction<any>>;
}

export default function PaymentForm({
    payment,
    setPayment,
}: Props) {
    const updateField = (field: string, value: any) => {
        setPayment((old: any) => ({
            ...old,
            [field]: value,
        }));
    };

    return (
        <View style={styles.container}>

            <TextInput
                mode="outlined"
                label="Description"
                value={payment.description}
                onChangeText={(text) =>
                    updateField("description", text)
                }
                style={styles.input}
            />

            <TextInput
                mode="outlined"
                label="Amount"
                keyboardType="decimal-pad"
                value={String(payment.amount)}
                onChangeText={(text) =>
                    updateField(
                        "amount",
                        text.replace(",", ".")
                    )
                }
                style={styles.input}
            />

            <TextInput
                mode="outlined"
                label="Due date"
                placeholder="YYYY-MM-DD"
                value={payment.dueDate}
                onChangeText={(text) =>
                    updateField("dueDate", text)
                }
                style={styles.input}
            />

            <TextInput
                mode="outlined"
                label="Payment method"
                value={payment.method}
                onChangeText={(text) =>
                    updateField("method", text)
                }
                style={styles.input}
            />

            <View style={styles.switchRow}>
                <Text
                    variant="titleMedium"
                >
                    Recurring
                </Text>

                <Switch
                    value={payment.recurring}
                    onValueChange={(value) =>
                        updateField("recurring", value)
                    }
                />
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
    },

    input: {
        marginBottom: 16,
        backgroundColor: "#fff",
    },

    sectionTitle: {
        marginBottom: 12,
        fontWeight: "700",
        color: "#475569",
    },

    methodsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 24,
    },

    method: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 16,
        backgroundColor: "#EEF2FF",
        color: "#4F46E5",
        fontWeight: "700",
        overflow: "hidden",
    },

    selectedMethod: {
        backgroundColor: "#4F46E5",
        color: "#fff",
    },

    switchRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
});