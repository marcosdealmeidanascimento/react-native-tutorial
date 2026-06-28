import AppHeader from "@/components/header";
import { apiClient } from "@/config/api";
import { useAuth } from "@/config/auth";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Card, Chip, FAB, Text } from "react-native-paper";

export function PaymentCard({ payment }: any) {
    const paid = payment.status === "PAID";
    const pending = payment.status === "PENDING";
    const failed = payment.status === "FAILED";
    const cancelled = payment.status === "CANCELLED";

    return (
        <Card style={styles.card}>
            <LinearGradient
                colors={
                    paid
                        ? ["#0f766e", "#14b8a6"]
                        : pending ? ["#fbbf24", "#f59e0b"] : failed ? ["#b6b6b6", "#a3a3a3"] : cancelled ? ["#f87171", "#ef4444"] : ["#312e81", "#6366f1"]
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
                    $ {Number(payment.amount).toFixed(2)}
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
    const [payments, setPayments] = useState<any>([]);
    const [page, setPage] = useState(0);
    const [status, setStatus] = useState<String | null>(null);
    const statusRef = useRef<string | null>(null);
    const [visible, setVisible] = useState<boolean>(false);

    const flatListRef = useRef(null);

    const handleFilter = (newStatus: string | null) => {
        setStatus(newStatus);
        setPage(0);
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    };

    const handleGetPayments = async (
        page: number = 0,
        status: string | null = null
    ) => {
        const sort = "dueDate,desc";
        let endpoint = `payment?page=${page}&size=10&sort=${sort}`;
        if (status) {
            endpoint += `&status=${status}`;
        }
        try {
            const response = await apiClient(endpoint, "GET");
            if (page === 0) {
                setPayments(response.content);
            } else {
                setPayments(old => [...old, ...response.content]);
            }
        } catch (error) {
            console.log(error);
        }
    };


    useEffect(() => {
        handleGetPayments(page, status);
    }, [page, status]);

    return (
        <View>
            <AppHeader title="Payments" />
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setVisible(!visible)}
                >
                    <Feather name="filter" size={20} color="#4F46E5" />

                    <Text style={styles.filterText}>
                        {status ?? "All"}
                    </Text>

                    <Feather
                        name={visible ? "chevron-up" : "chevron-down"}
                        size={18}
                        color="#4F46E5"
                    />
                </TouchableOpacity>

                {visible && (
                    <View style={styles.dropdown}>
                        {[
                            null,
                            "PAID",
                            "PENDING",
                            "FAILED",
                            "CANCELLED",
                        ].map(item => (
                            <TouchableOpacity
                                key={item ?? "ALL"}
                                style={[
                                    styles.dropdownItem,
                                    status === item && styles.selectedItem,
                                ]}
                                onPress={() => {
                                    handleFilter(item);
                                    setVisible(false);
                                }}
                            >
                                <Text style={styles.dropdownText}>
                                    {item ?? "ALL"}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
            <FlatList
                ref={flatListRef}
                data={payments}
                keyExtractor={(item: any) => item.id}
                renderItem={({ item }) => (
                    <PaymentCard payment={item} />
                )}
                onEndReached={() => {
                    setPage(prev => prev + 1);
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
    filterContainer: {
        paddingHorizontal: 16,
        alignItems: "flex-end",
        marginBottom: 8,
        zIndex: 10,
    },

    filterButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 16,
        elevation: 5,
        marginTop: 8,
    },

    filterText: {
        color: "#4F46E5",
        fontWeight: "700",
    },

    dropdown: {
        position: "absolute",
        top: 55,
        width: 180,
        backgroundColor: "#fff",
        borderRadius: 18,
        elevation: 8,
        overflow: "hidden",
    },

    dropdownItem: {
        paddingVertical: 14,
        paddingHorizontal: 16,
    },

    selectedItem: {
        backgroundColor: "#EEF2FF",
    },

    dropdownText: {
        fontWeight: "600",
    },
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
