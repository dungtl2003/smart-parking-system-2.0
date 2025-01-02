import { ReactNode, createContext, useState } from "react";
import { authService, userService } from "@/services";
import { User, Customer } from "@/types/model";

interface CurrentUserContextProps {
  currentUser: Customer | undefined | null;
  setCurrentUser: (user: Customer | null) => void;
  updateCurrentUser: () => Promise<void>;
}

const CurrentUserContext = createContext<CurrentUserContextProps | undefined>(
  undefined
);

const CurrentUserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<Customer | null | undefined>(
    undefined
  );

  const updateCurrentUser = async () => {
    const userHolder: User | null = authService.getUserInTokenPayload();
    let user: Customer | null = null;
    if (userHolder) {
      user = await userService.apis.getUser(userHolder.userId);
    }
    setCurrentUser(user);
  };

  return (
    <CurrentUserContext.Provider
      value={{ currentUser, setCurrentUser, updateCurrentUser }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
};

export {
  CurrentUserProvider,
  CurrentUserContext,
  type CurrentUserContextProps,
};
