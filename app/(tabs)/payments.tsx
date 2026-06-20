import AppHeader from "@/components/header";
import { apiClient } from "@/config/api";
import { useAuth } from "@/config/auth";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Card, Chip, FAB, Text } from "react-native-paper";

export function PaymentCard({ payment }: any) {
    const paid = payment.status === "PAID";

    return (
        <Card style={styles.card}>
            <LinearGradient
                colors={
                    paid
                        ? ["#0f766e", "#14b8a6"]
                        : ["#312e81", "#6366f1"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.label}>
                            {payment.description}
                        </Text>

                        <Text style={styles.date}>
                            Vencimento {payment.dueDate}
                        </Text>
                    </View>

                    <View style={styles.iconContainer}>
                        <Feather
                            name={paid ? "check-circle" : "clock"}
                            size={28}
                            color="#fff"
                        />
                    </View>
                </View>

                <Text style={styles.amount}>
                    R$ {Number(payment.amount).toFixed(2)}
                </Text>

                <View style={styles.footer}>
                    <Chip
                        textStyle={{
                            color: "#fff",
                            fontWeight: "700",
                        }}
                        style={{
                            backgroundColor: "rgba(255,255,255,0.15)",
                        }}
                    >
                        {payment.status}
                    </Chip>

                    <Feather
                        name="arrow-right"
                        size={20}
                        color="#fff"
                    />
                </View>
            </LinearGradient>
        </Card>
    );
}

export default function PaymentsScreen() {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [page, setPage] = useState(0);

    const flatListRef = useRef(null);

    const handleGetPayments = async (page: number = 0) => {
        try {
            const response = await apiClient(`payment?page=${page}&size=10`, "GET", null);
            setPayments(old => [...old, ...response.content]);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        handleGetPayments();
    }, []);

    return (
        <View>
            <AppHeader title="Payments" />
            <FlatList
                ref={flatListRef}
                data={payments}
                keyExtractor={(item: any) => item.id}
                renderItem={({ item }) => (
                    <PaymentCard payment={item} />
                )}
                onEndReached={() => {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    handleGetPayments(nextPage);
                }}
            />
            <FAB style={styles.fab} icon="arrow-up" onPress={() => {
                flatListRef.current.scrollToOffset({
                    offset: 0,
                    animated: true,
                });
            }} />
        </View>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: "absolute",
        right: 16,
        bottom: 160,
    },
    card: {
        marginHorizontal: 16,
        marginVertical: 10,
        borderRadius: 24,
        overflow: "hidden",
        elevation: 12,
    },

    gradient: {
        padding: 24,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    label: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
    },

    date: {
        color: "rgba(255,255,255,0.7)",
        marginTop: 4,
    },

    amount: {
        color: "#fff",
        fontSize: 36,
        fontWeight: "900",
        marginTop: 24,
        letterSpacing: 1,
    },

    footer: {
        marginTop: 24,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: "rgba(255,255,255,0.15)",
        justifyContent: "center",
        alignItems: "center",
    },
});
