import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { CreateProposalParams } from "../types/governance";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export default function CreateProposal() {
  const navigate = useNavigate();
  const { account, votingPower, addProposal } = useStore();
  const [formData, setFormData] = useState<CreateProposalParams>({
    forumPostLink: "",
    title: "",
    summary: "",
    parameterChange: undefined,
  });
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [forumLinkError, setForumLinkError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isValidForumLink = (link: string) => {
    return link.startsWith("https://forum.massa.community/");
  };

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

      if (!isValidForumLink(formData.forumPostLink)) {
        throw new Error(
          "Forum link must start with https://forum.massa.community/"
        );
      }

      // Validate JSON one last time before submission
      if (jsonInput && !jsonError) {
        try {
          const parsed = JSON.parse(jsonInput);
          formData.parameterChange = parsed;
        } catch (err) {
          throw new Error("Invalid JSON format for parameter change");
        }
      }

      const proposalId = await addProposal(formData);
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
      setJsonInput(value);
      if (value.trim() === "") {
        setJsonError(null);
        setFormData((prev) => ({ ...prev, parameterChange: undefined }));
      } else {
        try {
          const parsed = JSON.parse(value);
          setJsonError(null);
          setFormData((prev) => ({ ...prev, parameterChange: parsed }));
        } catch (err) {
          setJsonError("Invalid JSON format");
        }
      }
    } else if (name === "forumPostLink") {
      setForumLinkError(
        value && !isValidForumLink(value)
          ? "Forum link must start with https://forum.massa.community/"
          : null
      );
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonInput(formatted);
      setJsonError(null);
      setFormData((prev) => ({ ...prev, parameterChange: parsed }));
    } catch (err) {
      setJsonError("Cannot format invalid JSON");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-f-primary mas-title mb-2">Create New Proposal</h1>
        <p className="text-f-tertiary mas-body">
          Submit a new governance proposal to improve the platform. Make sure to
          include a detailed forum post for discussion.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-s-error/10 text-s-error rounded-lg border border-s-error/20 mas-body2">
          {error}
        </div>
      )}

      <div className="bg-secondary border border-border rounded-lg shadow-sm divide-y divide-border">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-6">
            <h2 className="text-f-primary mas-h2">Basic Information</h2>

            <div>
              <label
                htmlFor="title"
                className="block text-f-primary mas-body2 mb-2"
              >
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-f-primary focus:outline-none focus:ring-2 focus:ring-brand/30 mas-body"
                required
                maxLength={100}
                placeholder="Enter a clear and concise title"
              />
            </div>

            <div>
              <label
                htmlFor="forumPostLink"
                className="block text-f-primary mas-body2 mb-2"
              >
                Forum Post Link
              </label>
              <input
                type="url"
                name="forumPostLink"
                id="forumPostLink"
                value={formData.forumPostLink}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-background border rounded-lg text-f-primary focus:outline-none focus:ring-2 focus:ring-brand/30 mas-body ${
                  forumLinkError ? "border-s-error" : "border-border"
                }`}
                required
                placeholder="https://forum.massa.community/your-proposal"
              />
              {forumLinkError && (
                <p className="mt-1 text-s-error mas-caption">
                  {forumLinkError}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="summary"
                className="block text-f-primary mas-body2 mb-2"
              >
                Summary
              </label>
              <textarea
                name="summary"
                id="summary"
                rows={4}
                value={formData.summary}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-f-primary focus:outline-none focus:ring-2 focus:ring-brand/30 mas-body resize-none"
                required
                maxLength={500}
                placeholder="Provide a brief summary of your proposal"
              />
              <p className="mt-1 text-right text-f-tertiary mas-caption">
                {formData.summary.length}/500 characters
              </p>
            </div>
          </div>

          {/* Technical Details Section */}
          <div className="space-y-6">
            <h2 className="text-f-primary mas-h2">Technical Details</h2>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="parameterChange"
                  className="text-f-primary mas-body2"
                >
                  Parameter Change (JSON)
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={formatJson}
                    className="text-brand hover:text-brand/80 mas-caption transition-colors"
                  >
                    Format JSON
                  </button>
                  <div className="flex items-center text-f-tertiary">
                    <InformationCircleIcon className="h-4 w-4 mr-1" />
                    <span className="mas-caption">Optional</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <textarea
                  name="parameterChange"
                  id="parameterChange"
                  rows={8}
                  value={jsonInput}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-background border rounded-lg font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand/30 ${
                    jsonError
                      ? "border-s-error text-s-error"
                      : "border-border text-f-primary"
                  }`}
                  placeholder='{
  "parameter": "value",
  "nested": {
    "key": "value"
  }
}'
                  spellCheck="false"
                />
                {jsonError && (
                  <p className="mt-1 text-s-error mas-caption">{jsonError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Section */}
          <div className="pt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-f-tertiary">
              <InformationCircleIcon className="h-5 w-5" />
              <div className="mas-body2">
                <p>Cost: 1000 MAS</p>
                <p>Required MASOG Balance: 1000</p>
              </div>
            </div>
            <button
              type="submit"
              className={`px-6 py-2 rounded-lg mas-buttons transition-all duration-200 ${
                loading || !account || votingPower < BigInt(1000)
                  ? "bg-tertiary text-f-tertiary cursor-not-allowed"
                  : "bg-brand text-neutral hover:opacity-90 active-button"
              }`}
              disabled={loading || !account || votingPower < BigInt(1000)}
            >
              {loading ? "Creating..." : "Create Proposal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
