import { AuthContextProps } from "@/context";
import AuthContext from "@/context/auth-context";
import { useContext } from "react";

/**
 * A hook so that you don't have to call `useContext(AuthContext)` all the
 * time.
 * @returns All state values and value modifiers from {@link AuthProvider}.
 */
const useAuth = (): AuthContextProps => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return authContext;
};

export default useAuth;
