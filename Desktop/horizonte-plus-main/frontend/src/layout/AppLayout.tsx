import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { useViewMode } from "../context/ViewModeContext";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { isStudentView, impersonatedUser, stopImpersonating } = useViewMode();

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        {isStudentView && impersonatedUser && (
          <div className="flex items-center justify-between bg-warning-50 px-4 py-2 text-sm text-warning-700 dark:bg-warning-500/15 dark:text-warning-400">
            <span>
              Viendo como <strong>{impersonatedUser.firstName} {impersonatedUser.lastName}</strong>
              <span className="ml-1 text-xs opacity-70">({impersonatedUser.email})</span>
            </span>
            <button
              onClick={stopImpersonating}
              className="rounded-lg bg-warning-100 px-3 py-1 text-xs font-medium hover:bg-warning-200 dark:bg-warning-500/25 dark:hover:bg-warning-500/35"
            >
              Volver a mi cuenta
            </button>
          </div>
        )}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
