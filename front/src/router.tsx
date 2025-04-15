import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Proposals from "./pages/Proposals";
import CreateProposal from "./pages/CreateProposal";
import ProposalDetails from "./pages/ProposalDetails";
import NotFound from "./pages/NotFound";
import Layout from "./components/layout/Layout";

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
          <Proposals />
        ),
      },
      {
        path: "proposals/:id",
        element: (
          <ProposalDetails />
        ),
      },
      {
        path: "create",
        element: (
          <CreateProposal />
        ),
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
