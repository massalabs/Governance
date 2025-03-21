import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Proposals from "./pages/Proposals";
import CreateProposal from "./pages/CreateProposal";
import ProposalDetails from "./pages/ProposalDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "proposals",
        element: (
          <ProtectedRoute>
            <Proposals />
          </ProtectedRoute>
        ),
      },
      {
        path: "proposals/:id",
        element: (
          <ProtectedRoute>
            <ProposalDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: "create",
        element: (
          <ProtectedRoute>
            <CreateProposal />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
