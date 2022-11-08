import React from "react";
import Wrapper from "./Wrapper";
import { WrapperVariant } from "./Wrapper";
import Navbar from "./Navbar";

interface LayoutProps {
  variant?: WrapperVariant;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, variant }) => {
  return (
    <>
      <Navbar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </>
  );
};

export default Layout;
