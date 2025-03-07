import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGovernanceStore } from "../store/useGovernanceStore";
import { CreateProposalParams } from "../types/governance";

export default function CreateProposal() {
  const navigate = useNavigate();
  const { createProposal, account, votingPower } = useGovernanceStore();
  const [formData, setFormData] = useState<CreateProposalParams>({
    forumPostLink: "",
    title: "",
    summary: "",
    parameterChange: undefined,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      if (votingPower < BigInt(1000)) {
        throw new Error("Insufficient MASOG balance. Required: 1000");
      }

      const proposalId = await createProposal(formData);
      navigate(`/proposals/${proposalId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create proposal"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "parameterChange") {
      try {
        const parsed = JSON.parse(value);
        setFormData((prev) => ({
          ...prev,
          parameterChange: parsed,
        }));
      } catch (err) {
        setError("Invalid JSON format for parameter change");
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-text-light dark:text-text-dark mb-6">
        Create New Proposal
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="label">
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleChange}
            className="input mt-1"
            required
            maxLength={100}
          />
        </div>

        <div>
          <label htmlFor="forumPostLink" className="label">
            Forum Post Link
          </label>
          <input
            type="url"
            name="forumPostLink"
            id="forumPostLink"
            value={formData.forumPostLink}
            onChange={handleChange}
            className="input mt-1"
            required
          />
        </div>

        <div>
          <label htmlFor="summary" className="label">
            Summary
          </label>
          <textarea
            name="summary"
            id="summary"
            rows={4}
            value={formData.summary}
            onChange={handleChange}
            className="input mt-1"
            required
            maxLength={500}
          />
        </div>

        <div>
          <label htmlFor="parameterChange" className="label">
            Parameter Change (JSON)
          </label>
          <textarea
            name="parameterChange"
            id="parameterChange"
            rows={6}
            value={JSON.stringify(formData.parameterChange || {}, null, 2)}
            onChange={handleChange}
            className="input mt-1 font-mono"
            placeholder='{"parameter": "value"}'
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-secondary-light dark:text-secondary-dark">
            Cost: 1000 MAS | Required MASOG Balance: 1000
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !account || votingPower < BigInt(1000)}
          >
            {loading ? "Creating..." : "Create Proposal"}
          </button>
        </div>
      </form>
    </div>
  );
}
