import React from "react";
import { Outlet, useNavigation } from "react-router-dom";
import { Toaster } from "sonner";
import {
  ScrollToTop,
  ScrollToTopButton,
  TopBarProgress,
} from "@/components/effect";
import UserHeader from "./user-header";
import AppFooter from "./app-footer";

const UserLayout: React.FC = () => {
  const navigation = useNavigation();

  return (
    <main>
      <ScrollToTop />
      <div className="py-5 bg-[url('homepage_bg.jpg')] bg-cover bg-fixed bg-center relative">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <UserHeader className="z-50 relative" />
        <div className="relative flex justify-center w-full py-10 min-h-[70vh] gap-6 4xl_gap-10">
          {navigation.state === "loading" ? <TopBarProgress /> : <Outlet />}
        </div>
      </div>
      <AppFooter />
      <ScrollToTopButton className="bottom-5 right-4" />
      <Toaster
        richColors
        toastOptions={{
          className: "text-xl h-[5rem] right-10 bottom-5 ",
        }}
      />
    </main>
  );
};

export default UserLayout;
