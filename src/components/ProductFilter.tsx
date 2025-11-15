import React from "react";
import { View, StyleSheet } from "react-native";
import RNPickerSelect, { PickerStyle } from "react-native-picker-select";
import { RFValue, RFPercentage } from "react-native-responsive-fontsize";
import { colors } from "../Styles/Colors";
import { fonts } from "../Styles/Fonts";

interface ProductFilterProps {
    categorias: any[];
    estados: any[];
    tipos: any[];
    setCategoria: React.Dispatch<React.SetStateAction<string | null>>;
    setEstado: React.Dispatch<React.SetStateAction<string | null>>;
    setTipo: React.Dispatch<React.SetStateAction<string | null>>;
    setOrden: React.Dispatch<React.SetStateAction<string>>;
}

export default function ProductFilter({
    categorias,
    estados,
    tipos,
    setCategoria,
    setEstado,
    setTipo,
    setOrden,
}: ProductFilterProps) {
    return (
        <View style={styles.filterContainer}>
            <View style={styles.filterRow}>
                <View style={styles.filterItem}>
                    <RNPickerSelect
                        onValueChange={(value) => setCategoria(value)}
                        placeholder={{ label: "Categoría", value: null }}
                        items={categorias.map((c) => ({
                            label: c.nombre,
                            value: c.nombre,
                        }))}
                        style={pickerSelectStyles}
                    />
                </View>

                <View style={styles.filterItem}>
                    <RNPickerSelect
                        onValueChange={(value) => setEstado(value)}
                        placeholder={{ label: "Estado", value: null }}
                        items={estados.map((e) => ({
                            label: e.nombre,
                            value: e.nombre,
                        }))}
                        style={pickerSelectStyles}
                    />
                </View>
            </View>

            <View style={styles.filterRow}>
                <View style={styles.filterItem}>
                    <RNPickerSelect
                        onValueChange={(value) => setTipo(value)}
                        placeholder={{ label: "Tipo", value: null }}
                        items={tipos.map((t) => ({
                            label: t.nombre,
                            value: t.nombre,
                        }))}
                        style={pickerSelectStyles}
                    />
                </View>

                <View style={styles.filterItem}>
                    <RNPickerSelect
                        onValueChange={(value) => setOrden(value)}
                        placeholder={{ label: "Precio", value: null }}
                        items={[
                            { label: "Menor a mayor", value: "asc" },
                            { label: "Mayor a menor", value: "desc" },
                        ]}
                        style={pickerSelectStyles}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    filterContainer: {
        marginBottom: RFPercentage(1.2),
        gap: RFPercentage(0.5),
    },
    filterRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        columnGap: RFValue(6),
    },
    filterItem: {
        flex: 1,
    },
});

const pickerSelectStyles: PickerStyle = {
    viewContainer: {
        backgroundColor: colors.fondoSecundario,
        borderRadius: RFValue(6),
        justifyContent: "center",
        height: RFValue(32),
        paddingHorizontal: RFValue(6),
    },
    inputIOS: {
        color: colors.letraSecundaria,
        fontSize: fonts.small,
        paddingVertical: 0,
        textAlignVertical: "center",
    },
    inputAndroid: {
        color: colors.letraSecundaria,
        fontSize: fonts.small,
        paddingVertical: 0,
        textAlignVertical: "center",
    },
    placeholder: {
        color: colors.infoLetra,
        fontSize: fonts.small,
    },
};
