import { NavigateOptions, useLocation, useNavigate } from "react-router-dom";

/**
 * A hook to config navigate
 *
 * @returns All state values and value modifiers.
 */
const useCustomNavigate = () => {
  const location = useLocation();
  const defaultNavigate = useNavigate();

  const navigate = (to: string, options?: NavigateOptions) => {
    defaultNavigate(to, {
      state: { from: location.pathname },
      ...options,
    });
  };

  return { navigate, location };
};

export default useCustomNavigate;
