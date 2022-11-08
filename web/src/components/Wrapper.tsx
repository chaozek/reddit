import { Box } from "@chakra-ui/react";
import React from "react";

export type WrapperVariant = "small" | "regular";

interface WrapperProps {
  variant?: WrapperVariant;
  children: React.ReactNode;
}

const Wrapper: React.FC<WrapperProps> = ({ children, variant = "regular" }) => {
  return (
    <Box
      mx="auto"
      maxW={variant === "regular" ? "800px" : "400px"}
      w="100%"
      mt={8}
    >
      {children}
    </Box>
  );
};

export default Wrapper;
