import React from "react";
import { Icon, IconProps } from "@chakra-ui/react";
import { IconType } from "react-icons";

// Define the props for the ChakraIcon component
interface ChakraIconProps extends IconProps {
  icon: IconType; // Ensure the icon prop is of type IconType
}

// Create the ChakraIcon component using forwardRef
export const ChakraIcon = React.forwardRef<SVGSVGElement, ChakraIconProps>(
  ({ icon, ...props }, ref) => {
    return <Icon as={icon} ref={ref} {...props} />;
  }
);

// Add display name for better debugging
ChakraIcon.displayName = "ChakraIcon";
