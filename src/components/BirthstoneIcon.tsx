import React, { useMemo, useState } from "react";
import { Image, ImageSourcePropType, View } from "react-native";

interface BirthstoneIconProps {
  image: ImageSourcePropType;
  size?: number;
}

const SHADOW_INSET = 0.15;

/** Renders a birthstone gem image with shadow inset effect. */
const BirthstoneIcon = React.memo(function BirthstoneIcon({
  image,
  size = 40,
}: BirthstoneIconProps) {
  const [error, setError] = useState(false);
  const padding = size * SHADOW_INSET;
  const imageSize = size + padding * 2;

  const containerStyle = useMemo(() => ({ width: size, height: size }), [size]);

  const imageStyle = useMemo(
    () => ({
      width: imageSize,
      height: imageSize,
      marginTop: -padding,
      marginLeft: -padding,
    }),
    [imageSize, padding],
  );

  return (
    <View style={containerStyle}>
      {!error && (
        <Image
          source={image}
          style={imageStyle}
          resizeMode="contain"
          accessible={false}
          onError={() => setError(true)}
        />
      )}
    </View>
  );
});

export default BirthstoneIcon;
