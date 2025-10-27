import { AdminLayout } from "../layouts";
import {
  UsersAdmin,
  MeetingsAdmin,
  HomesAdmin,
  ActasAdmin,
  SettingsAdmin,
  SupportsAdmin,
  ActaEditorPage,
} from "../pages/Admin";

const routesAdmin = [
  {
    path: "/app",
    layout: AdminLayout,
    component: HomesAdmin,
    exact: true,
  },

  {
    path: "/app/meetings",
    layout: AdminLayout,
    component: MeetingsAdmin,
    exact: true,
  },

  {
    path: "/app/users",
    layout: AdminLayout,
    component: UsersAdmin,
    exact: true,
  },

  {
    path: "/app/actas",
    layout: AdminLayout,
    component: ActasAdmin, // Assuming you meant to use UsersAdmin here, change if needed
    exact: true,
  },

  {
    path: "/app/settings",
    layout: AdminLayout,
    component: SettingsAdmin, // Assuming you meant to use UsersAdmin here, change if needed
    exact: true,
  },

  {
    path: "/app/supports",
    layout: AdminLayout,
    component: SupportsAdmin, // Assuming you meant to use UsersAdmin here, change if needed
    exact: true,
  },

  {
    path: "/app/actas/:sessionId/editar",
    layout: AdminLayout,
    component: ActaEditorPage, // Assuming you meant to use UsersAdmin here, change if needed
    exact: true,
  },
];

export default routesAdmin;
