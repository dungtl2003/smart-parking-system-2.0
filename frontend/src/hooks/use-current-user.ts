import {
  CurrentUserContext,
  CurrentUserContextProps,
} from "@/context/current-user-context";
import { useContext } from "react";

const useCurrentUser = (): CurrentUserContextProps => {
  const currentUserContext = useContext(CurrentUserContext);

  if (!currentUserContext) {
    throw new Error(
      "useCurrentUser must be used within an CurrentUserProvider"
    );
  }

  return currentUserContext;
};

export default useCurrentUser;
