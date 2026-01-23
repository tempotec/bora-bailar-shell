import React from "react";
import { View, Text, StyleSheet, Image, Pressable, Linking } from "react-native";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface Brand {
    id: string;
    name: string;
    logo: any; // ImageSource
    color?: string; // Fallback background color
}

// Local partner assets
const uberLogo = require("../assets/partners/uber.jpg");
const itauLogo = require("../assets/partners/itau.jpg");
const ifoodLogo = require("../assets/partners/ifood.jpg");
const globoLogo = require("../assets/partners/globo.jpg");
const beardLogo = require("../assets/partners/beard.jpg");
const guettaLogo = require("../assets/partners/guetta.png");

const BRANDS: Brand[] = [
    {
        id: "1",
        name: "Uber",
        logo: uberLogo,
        color: "#000000",
    },
    {
        id: "2",
        name: "Itaú",
        logo: itauLogo,
        color: "#EC7000",
    },
    {
        id: "3",
        name: "iFood",
        logo: ifoodLogo,
        color: "#EA1D2C",
    },
    {
        id: "4",
        name: "Globo",
        logo: globoLogo,
        color: "#FFFFFF",
    },
    {
        id: "5",
        name: "Guetta",
        logo: guettaLogo,
        color: "#0f0f0fff", // White background for Guetta
    },
    {
        id: "6",
        name: "Zé Delivery",
        logo: beardLogo,
        color: "#FFD100",
    },
];

export function PartnerBrands() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Marcas parceiras</Text>

            <View style={styles.grid}>
                {BRANDS.map((brand) => (
                    <Pressable
                        key={brand.id}
                        style={[styles.brandCard, { backgroundColor: brand.color || "#FFFFFF" }]}
                        onPress={() => {
                            // Optional: link to brand website
                            console.log(`Open ${brand.name}`);
                        }}
                    >
                        <Image
                            source={brand.logo}
                            style={styles.logo}
                            resizeMode="cover"
                        />
                    </Pressable>
                ))}
            </View>

            <Text style={styles.copyright}>
                © 2025 BoraBailar. Todos os direitos reservados.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.lg,
        marginTop: Spacing.xl,
        marginBottom: Spacing.sm,
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.dark.text,
        marginBottom: Spacing.lg,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: Spacing.md,
    },
    brandCard: {
        width: "30%", // approx 3 items per row with gap
        aspectRatio: 1,
        borderRadius: BorderRadius.lg,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        overflow: "hidden",
    },
    logo: {
        width: "100%",
        height: "100%",
    },
    copyright: {
        marginTop: Spacing.xl + Spacing.md,
        textAlign: "center",
        fontSize: 11,
        color: Colors.dark.textSecondary,
        fontWeight: "500",
    },
});
