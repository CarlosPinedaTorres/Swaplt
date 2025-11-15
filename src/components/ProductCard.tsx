import React, { useState, useRef } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../Styles/Colors";
import { fonts } from "../Styles/Fonts";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

import { Dimensions } from "react-native";
const { width: screenWidth } = Dimensions.get("window");

interface ProductCardProps {
    item: any;
    onPress: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    isOwner?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ item, onPress, onEdit, onDelete, isOwner, }) => {
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuCoords, setMenuCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const menuButtonRef = useRef<React.ComponentRef<typeof TouchableOpacity>>(null);



    const openMenu = () => {
        const ref = menuButtonRef.current;
        if (ref) {
            ref.measureInWindow((x, y, width, height) => {
                const menuWidth = screenWidth * 0.35;
                const adjustedX =
                    x + width + RFValue(10) > screenWidth
                        ? screenWidth - menuWidth - RFValue(10)
                        : Math.max(RFValue(10), x - menuWidth + width);

                const menuHeight = 90;
                const screenHeight = Dimensions.get("window").height;

                const safeY =
                    y + height + menuHeight > screenHeight
                        ? y - menuHeight - RFValue(5)
                        : y + height;

                setMenuCoords({ x: adjustedX, y: safeY });
                setMenuVisible(true);
            });
        }
    };

    return (
        <TouchableOpacity activeOpacity={0.85} style={styles.card} onPress={onPress}>
            <Image
                source={require("../assets/images/defaultProfile.png")}
                style={styles.image}
                resizeMode="cover"
            />

            {isOwner && (
                <TouchableOpacity
                    ref={menuButtonRef}
                    style={styles.menuButton}
                    onPress={openMenu}
                >
                    <Ionicons
                        name="ellipsis-vertical"
                        size={18}
                        color={colors.letraSecundaria}
                    />
                </TouchableOpacity>
            )}

            <View style={styles.infoContainer}>
                <Text style={styles.nombre} numberOfLines={1}>
                    {item.nombre}
                </Text>

                <Text style={styles.precio}>
                    {item.precio ? `${item.precio} €` : "Sin precio"}
                </Text>

                <Text style={styles.detalle}>
                    {item.categoria?.nombre} · {item.estado?.nombre}
                </Text>

                {item.ubicacion && (
                    <Text style={styles.detalle}>
                        <Ionicons name="location-outline" size={12} /> {item.ubicacion}
                    </Text>
                )}
            </View>



            <Modal
                visible={menuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPressOut={() => setMenuVisible(false)}
                >
                    <View
                        style={[
                            styles.menuContainer,
                            {
                                top: menuCoords.y,
                                left: menuCoords.x
                            },
                        ]}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                setMenuVisible(false);
                                onEdit && onEdit();
                            }}
                            style={styles.menuOption}
                        >
                            <Ionicons
                                name="create-outline"
                                size={16}
                                color={colors.letraSecundaria}
                            />
                            <Text style={styles.menuText}>Editar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                setMenuVisible(false);
                                onDelete && onDelete();
                            }}
                            style={styles.menuOption}
                        >
                            <Ionicons name="trash-outline" size={16} color={colors.error} />
                            <Text style={[styles.menuText, { color: colors.error }]}>
                                Eliminar
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </TouchableOpacity>
    );
};

export default ProductCard;
const styles = StyleSheet.create({
    detalle: {
        fontSize: fonts.small,
        color: colors.infoLetra,
    },

    card: {
        backgroundColor: colors.fondoSecundario,
        width: "47%",
        borderRadius: RFValue(12),
        overflow: "hidden",
        marginBottom: RFPercentage(2),
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    image: {
        width: "100%",
        height: RFPercentage(18),
    },
    infoContainer: {
        padding: RFPercentage(1.5),
    },
    nombre: {
        fontSize: fonts.small,
        fontWeight: "bold",
        color: colors.letraSecundaria,
        marginBottom: RFPercentage(0.5),
    },
    precio: {
        fontSize: fonts.small,
        color: colors.letraTitulos,
        marginBottom: RFPercentage(1),
    },
    menuButton: {
        position: "absolute",
        top: RFValue(8),
        right: RFValue(8),
        backgroundColor: "rgba(0,0,0,0.2)",
        borderRadius: RFValue(12),
        padding: 4,
        zIndex: 5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "transparent",
    },
    menuContainer: {
        position: "absolute",
        backgroundColor: colors.fondoSecundario,
        borderRadius: RFValue(8),
        paddingVertical: 6,
        width: screenWidth * 0.35,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 5,
    },

    menuOption: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    menuText: {
        marginLeft: 10,
        fontSize: fonts.small,
        color: colors.letraSecundaria,
    },
});
