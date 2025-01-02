import useCurrentUser from "@/hooks/use-current-user";
import { Role } from "@/types/enum";
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute: React.FC<{
  children: ReactNode;
  allowedRoles?: Role[];
}> = ({ children, allowedRoles = [Role.STAFF] }) => {
  const { currentUser } = useCurrentUser();

  return (
    <>
      {currentUser !== undefined &&
        (currentUser ? (
          allowedRoles.find((role) => role === currentUser.role) ? (
            children
          ) : (
            <Navigate
              to="/unauthorized"
              state={{ unstable_useViewTransitionState: true }}
              replace={true}
            />
          )
        ) : (
          <Navigate
            to="/login"
            state={{ unstable_useViewTransitionState: true }}
            replace={true}
          />
        ))}
    </>
  );
};

export default ProtectedRoute;
