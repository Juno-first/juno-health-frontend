import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "./hooks";
import { logout } from "../slices/userSlice";

export function useLogout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };
}
