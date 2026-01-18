import { useSelector } from "react-redux";
import { RootState } from "@/store/slices";
import { UserRole } from "@/types/shared";

export const useAuthRole = () => {
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);
  const isAdmin = isAuthenticated && user?.role === UserRole.ADMIN;
  return { isAuthenticated, user, isAdmin } as const;
};