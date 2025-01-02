import { ScrollToTop, TopBarProgress } from "@/components/effect";
import { Outlet, useNavigation } from "react-router-dom";
import { Toaster } from "sonner";
import StaffHeader from "./admin-header";
import AppFooter from "./app-footer";

const AdminLayout: React.FC = () => {
  const navigation = useNavigation();

  return (
    <main>
      <ScrollToTop />
      <StaffHeader />
      <main className="flex min-h-[80vh] h-max w-full flex-col">
        <div className="mx-auto w-sm md_w-md lg_w-lg xl_w-xl 2xl_w-2xl 4xl_w-3xl">
          {navigation.state === "loading" ? <TopBarProgress /> : <Outlet />}
        </div>
      </main>
      <AppFooter />
      <Toaster
        richColors
        toastOptions={{
          className: "text-xl h-[4rem] right-10 bottom-5",
        }}
      />
    </main>
  );
};

export default AdminLayout;
