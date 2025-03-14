import { useEffect, useState } from "react";
import { useAccountStore } from "@massalabs/react-ui-kit";

export function useProposals() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { connectedAccount } = useAccountStore();

  const fetchProposals = async () => {
    if (!connectedAccount) {
      setProposals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Add your API call here
      const response = await fetch("/api/proposals");
      const data = await response.json();
      setProposals(data);
    } catch (error) {
      console.error("Error fetching proposals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [connectedAccount]);

  return { proposals, loading, refetch: fetchProposals };
}
