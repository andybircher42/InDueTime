import { Text } from "react-native";

function createMockIcon(name: string) {
  const Icon = (props: { name?: string; size?: number; color?: string }) => (
    <Text testID={`icon-${name}`}>{props.name}</Text>
  );
  Icon.displayName = name;
  return Icon;
}

export const Ionicons = createMockIcon("Ionicons");
