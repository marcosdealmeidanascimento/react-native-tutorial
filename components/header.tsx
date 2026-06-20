import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type AppHeaderProps = {
    title: string;
}

export default function AppHeader({
    title,
}: AppHeaderProps) {
    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.title}>{title}</Text>
            </View>
            <View style={styles.iconContainer}>
                <Feather name="bell" size={24} color="6366F1" />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 16,

        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

        backgroundColor: "#F8FAFC",
    },

    subtitle: {
        color: "#94A3B8",
        fontSize: 14,
    },

    title: {
        marginTop: 4,

        fontSize: 28,
        fontWeight: "700",

        color: "#0F172A",
    },

    iconContainer: {
        width: 48,
        height: 48,

        borderRadius: 24,

        justifyContent: "center",
        alignItems: "center",

        backgroundColor: "#FFFFFF",

        elevation: 4,
    },
});