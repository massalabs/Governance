import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import { Loading } from "@/components/ui/Loading";
import CreateProposal from "./pages/CreateProposal";
import Home from "./pages/Home";
import ProposalDetails from "./pages/ProposalDetails";
import Proposals from "./pages/Proposals";


export default function App() {
  return (
    <BrowserRouter>
      {/* <Suspense
        fallback={
          <div className="min-h-screen bg-secondary dark:bg-darkCard h-screen w-screen flex items-center justify-center">
            <Loading text="" size="lg" />
          </div>
        }
      > */}
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/proposals" element={<Proposals />} />
          <Route path="/create" element={<CreateProposal />} />
          <Route path="/proposals/:id" element={<ProposalDetails />} />
        </Route>
      </Routes>
      {/* </Suspense> */}
    </BrowserRouter>
  );
}
