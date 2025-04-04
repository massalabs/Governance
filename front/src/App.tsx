import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";

import CreateProposal from "./pages/CreateProposal";
import Home from "./pages/Home";
import ProposalDetails from "./pages/ProposalDetails";
import Proposals from "./pages/Proposals";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/proposals" element={<Proposals />} />
          <Route path="/create" element={<CreateProposal />} />
          <Route path="/proposals/:id" element={<ProposalDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
