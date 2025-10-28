import { StyleSheet ,Dimensions} from "react-native";
import { colors } from "../Styles/Colors";
import { fonts } from "../Styles/Fonts";

const {width}=Dimensions.get("window");

export default StyleSheet.create({

    input:{
        width:width*0.85,
        alignSelf:"center",
        fontSize: fonts.medium,
        borderRadius:10,
        color:colors.letraSecundaria,
        backgroundColor:colors.fondoSecundario,
        marginBottom: 16,
        paddingVertical: 12,
        paddingHorizontal: 16, 
     }
})