import { NavLink } from "react-router-dom";
import { useAuth, useCustomNavigate } from "@/hooks";
import { toast } from "sonner";
import { Role } from "@/types/enum";
import { DropMenuLinkItem, DropdownAvatar } from "@/components/common";
import { FC, HTMLAttributes, useMemo, useRef } from "react";
import useCurrentUser from "@/hooks/use-current-user";
import { cn } from "@/lib/utils";
import { LinkItem } from "@/types/component";

const HomepageHeader: FC<HTMLAttributes<HTMLHeadElement>> = ({ ...props }) => {
  const { logout } = useAuth();
  const { currentUser } = useCurrentUser();
  const { location } = useCustomNavigate();
  const navItems = useRef<LinkItem[]>([
    {
      name: "Home Page",
      src: "/",
      visible: true,
    },
    {
      name: "Parking Area",
      src: "/parkingStatus",
      visible: true,
    },
  ]);
  const selectedRoute = useMemo<string>(
    () => location.pathname,
    [location.pathname]
  );

  return (
    <header
      className={cn(
        "flex justify-between items-center font-sans mx-5 px-10 rounded-2xl bg-white h-[5rem]",
        props.className
      )}
    >
      {/** WEBSITE LOGO */}
      <NavLink to="/" unstable_viewTransition>
        <img src="/logo-web.png" alt="logo" className="h-14" />
      </NavLink>

      <span className="flex items-center gap-5">
        {navItems.current.map((item) => (
          <NavLink
            key={item.name}
            to={item.src || "/"}
            unstable_viewTransition
            className={cn(
              "text-xl hover_scale-110 transition ease-out duration-300",
              selectedRoute === item.src &&
                "text-xl font-extrabold border-b-4 border-primary"
            )}
          >
            {item.name}
          </NavLink>
        ))}
      </span>

      {/** USER DROP DOWN MENU */}
      {currentUser ? (
        <DropdownAvatar onClick={() => toast.loading("Processing...")}>
          <DropMenuLinkItem
            item={{
              name: "Staff View",
              src: "/customers",
              visible: [Role.STAFF, Role.ADMIN].includes(currentUser.role)
                ? true
                : false,
            }}
          />
          <DropMenuLinkItem
            item={{
              name: "SignedIn View",
              src: "/logs",
              visible: [Role.STAFF, Role.ADMIN].includes(currentUser.role)
                ? false
                : true,
            }}
          />
          <DropMenuLinkItem
            item={{
              name: "Logout",
              visible: true,
              handleClick: async () => {
                const promise = logout();
                toast.promise(promise, {
                  loading: "Loging out...",
                  success: "Logout succeed",
                });
              },
            }}
          />
        </DropdownAvatar>
      ) : (
        <NavLink
          className="text-[1.3rem] hover_text-primary hover_font-semibold text-nowrap"
          to="/login"
          unstable_viewTransition={true}
        >
          Login
        </NavLink>
      )}
    </header>
  );
};

export default HomepageHeader;
