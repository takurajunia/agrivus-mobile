import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { QuickChatButton } from "../chat/QuickChatButton";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />

      {/* Quick Chat Button */}
      <QuickChatButton />
    </div>
  );
};

export default Layout;
