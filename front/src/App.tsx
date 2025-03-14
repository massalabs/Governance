import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Layout from "./components/Layout";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Proposals = lazy(() => import("./pages/Proposals"));
const CreateProposal = lazy(() => import("./pages/CreateProposal"));
const ProposalDetails = lazy(() => import("./pages/ProposalDetails"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/proposals" element={<Proposals />} />
            <Route path="/create" element={<CreateProposal />} />
            <Route path="/proposals/:id" element={<ProposalDetails />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
