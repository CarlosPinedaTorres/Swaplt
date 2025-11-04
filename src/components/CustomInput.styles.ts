import { StyleSheet, Dimensions } from "react-native";
import { colors } from "../Styles/Colors";
import { fonts } from "../Styles/Fonts";

const { width } = Dimensions.get("window");
import { RFValue } from "react-native-responsive-fontsize";

export default StyleSheet.create({

    input: {
        width: width * 0.85,          
        alignSelf: "center",
        fontSize: fonts.medium,        
        borderRadius: RFValue(10),
        color: colors.letraSecundaria,
        backgroundColor: colors.fondoSecundario,
        marginBottom: RFValue(16),
        paddingVertical: RFValue(12),
        paddingHorizontal: RFValue(16),
    }
})