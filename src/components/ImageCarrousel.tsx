import React from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";

const { width } = Dimensions.get("window");

interface Props {
  images: string[];
}

const ImageCarousel: React.FC<Props> = ({ images }) => {
  return (
    <View style={styles.container}>
      <Carousel
        width={width - 32}
        height={250}
        data={images}
        autoPlay
        autoPlayInterval={3000}
        loop
        scrollAnimationDuration={700}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
      />
    </View>
  );
};

export default ImageCarousel;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
});
