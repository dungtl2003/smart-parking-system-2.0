import { useCustomNavigate } from "@/hooks";
import useCurrentUser from "@/hooks/use-current-user";
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

const PreventUserLoginRoute: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { location } = useCustomNavigate();
  const { currentUser } = useCurrentUser();

  return (
    <>
      {currentUser !== undefined &&
        (currentUser ? (
          <Navigate
            to={location.state?.from || "/"}
            state={{ unstable_useViewTransitionState: true }}
            replace={true}
          />
        ) : (
          children
        ))}
    </>
  );
};

export default PreventUserLoginRoute;
