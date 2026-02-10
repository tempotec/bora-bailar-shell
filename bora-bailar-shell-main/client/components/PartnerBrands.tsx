import React, { useState } from "react";
import { View, Text, StyleSheet, Image, Pressable, Linking, Alert } from "react-native";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import type { PartnerBrand } from "@/services/realApi";

interface LocalBrand {
    id: string;
    name: string;
    logo: any;
    color?: string;
}

// Local partner assets (fallback)
const uberLogo = require("../assets/partners/uber.jpg");
const itauLogo = require("../assets/partners/itau.jpg");
const ifoodLogo = require("../assets/partners/ifood.jpg");
const globoLogo = require("../assets/partners/globo.jpg");
const beardLogo = require("../assets/partners/beard.jpg");
const guettaLogo = require("../assets/partners/guetta.png");

const FALLBACK_BRANDS: LocalBrand[] = [
    { id: "1", name: "Uber", logo: uberLogo, color: "#000000" },
    { id: "2", name: "Itaú", logo: itauLogo, color: "#EC7000" },
    { id: "3", name: "iFood", logo: ifoodLogo, color: "#EA1D2C" },
    { id: "4", name: "Globo", logo: globoLogo, color: "#FFFFFF" },
    { id: "5", name: "Guetta", logo: guettaLogo, color: "#0f0f0fff" },
    { id: "6", name: "Zé Delivery", logo: beardLogo, color: "#FFD100" },
];

// Component for brand logo with error handling
function BrandLogo({ logoUrl, fallbackLogo }: { logoUrl?: string; fallbackLogo?: any }) {
    const [imageError, setImageError] = useState(false);

    if (logoUrl && !imageError) {
        return (
            <Image
                source={{ uri: logoUrl }}
                style={styles.logo}
                resizeMode="cover"
                onError={() => setImageError(true)}
            />
        );
    }

    if (fallbackLogo) {
        return (
            <Image
                source={fallbackLogo}
                style={styles.logo}
                resizeMode="cover"
            />
        );
    }

    // Placeholder if no image available
    return (
        <View style={[styles.logo, { backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ fontSize: 24 }}>🏢</Text>
        </View>
    );
}

interface PartnerBrandsProps {
    partnerBrands?: PartnerBrand[];
    homeTexts?: Record<string, string>;
}

export function PartnerBrands({ partnerBrands, homeTexts }: PartnerBrandsProps) {
    // Use API data if available, fallback to local
    const useApiData = partnerBrands && partnerBrands.length > 0;

    const handleBrandPress = async (link: string | null, name: string) => {
        if (!link) {
            console.log(`Open ${name}`);
            return;
        }

        try {
            const canOpen = await Linking.canOpenURL(link);
            if (canOpen) {
                await Linking.openURL(link);
            } else {
                Alert.alert("Erro", "Não foi possível abrir o link.");
            }
        } catch (error) {
            console.warn("[PartnerBrands] Failed to open URL:", error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{homeTexts?.brands_section_title ?? 'Marcas parceiras'}</Text>

            <View style={styles.grid}>
                {useApiData
                    ? partnerBrands.map((brand) => (
                        <Pressable
                            key={brand.id}
                            style={styles.brandCard}
                            onPress={() => handleBrandPress(brand.link, brand.name)}
                        >
                            <BrandLogo logoUrl={brand.logoUrl} />
                        </Pressable>
                    ))
                    : FALLBACK_BRANDS.map((brand) => (
                        <Pressable
                            key={brand.id}
                            style={[styles.brandCard, { backgroundColor: brand.color || "#FFFFFF" }]}
                            onPress={() => handleBrandPress(null, brand.name)}
                        >
                            <BrandLogo fallbackLogo={brand.logo} />
                        </Pressable>
                    ))
                }
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
        width: "30%",
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
