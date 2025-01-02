import { AdminLayout, UserLayout } from "@/layout";
import {
  CardManagement,
  CustomerManagement,
  HomePage,
  Login,
  PageNotFound,
  ParkingStates,
  Unauthorized,
} from "@/pages";
import { cardService, userService, videoService } from "@/services";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./protected-route";
import { Role } from "@/types/enum";
import { AuthProvider } from "@/context";
import PreventUserLoginRoute from "./prevent-user-login-route";
import VideoManagement from "@/pages/video-management-page";
import ViewVideo from "@/pages/video-streaming-page";
import parkingSlotService from "@/services/parking-slot";
import StaffManagement from "@/pages/staff-management-page";

const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        <UserLayout />
      </AuthProvider>
    ),
    errorElement: <PageNotFound />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        id: "parking-status",
        path: "parkingStatus",
        loader: parkingSlotService.apis.getSlotsState,
        element: <ParkingStates />,
      },
      {
        path: "login",
        element: (
          <PreventUserLoginRoute>
            <Login />
          </PreventUserLoginRoute>
        ),
      },
      {
        path: "unauthorized",
        element: <Unauthorized />,
      },
    ],
  },
  {
    element: (
      <AuthProvider>
        <ProtectedRoute allowedRoles={[Role.STAFF, Role.ADMIN]}>
          <AdminLayout />
        </ProtectedRoute>
      </AuthProvider>
    ),
    errorElement: <PageNotFound />,
    children: [
      {
        path: "customers",
        id: "customer-management",
        loader: userService.apis.customer.getCustomers,
        element: <CustomerManagement />,
      },
      {
        path: "staffs",
        id: "staff-management",
        loader: userService.apis.staff.getStaffs,
        element: (
          <ProtectedRoute allowedRoles={[Role.ADMIN]}>
            <StaffManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "cards",
        id: "card-management",
        loader: () => cardService.apis.getCards(),
        element: <CardManagement />,
      },
      {
        path: "videos",
        children: [
          {
            index: true,
            id: "video-management",
            loader: videoService.apis.getVideos,
            element: <VideoManagement />,
          },
          {
            path: ":id",
            id: "view-video-page",
            loader: videoService.apis.getVideo,
            element: <ViewVideo />,
          },
        ],
      },
    ],
  },
]);

export default routes;
