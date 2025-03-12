import { useState, useEffect } from "react";
import { useGovernanceStore } from "../store/useGovernanceStore";
import {
  toast,
  useAccountStore,
  useWriteSmartContract,
} from "@massalabs/react-ui-kit";
import { CreateProposalParams } from "../types/governance";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useContractStore } from "@/store/useContractStore";
import { Args, Mas } from "@massalabs/massa-web3";
import { Proposal } from "@/serializable/Proposal";

const REQUIRED_MASOG = 1000n;

export default function CreateProposal() {
  const { userMasogBalance, fetchUserBalance } = useGovernanceStore();
  const hasEnoughMasog = userMasogBalance >= REQUIRED_MASOG;
  const { connectedAccount } = useAccountStore();
  const { callSmartContract } = useWriteSmartContract(connectedAccount!);
  const { governance } = useContractStore();

  useEffect(() => {
    fetchUserBalance(); // Force refresh the balance
  }, [fetchUserBalance]);

  const [formData, setFormData] = useState<CreateProposalParams>({
    title: "",
    forumPostLink: "",
    summary: "",
    parameterChange: undefined,
  });

  const [parameterChangeInput, setParameterChangeInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connectedAccount) {
      console.error("Please connect your wallet first");
      return;
    }

    if (!governance) {
      console.error("Governance contract not initialized");
      return;
    }

    if (!hasEnoughMasog) {
      console.error(
        `You need at least ${REQUIRED_MASOG} MASOG to create a proposal`
      );
      return;
    }

    try {
      setLoading(true);
      // Validate forum link
      if (!formData.forumPostLink.startsWith("https://forum.massa.community")) {
        throw new Error("Forum post link must be from forum.massa.community");
      }

      // Validate parameter change JSON
      if (parameterChangeInput) {
        try {
          const parsed = JSON.parse(parameterChangeInput);
          if (
            typeof parsed !== "object" ||
            !parsed.parameter ||
            !parsed.value
          ) {
            throw new Error(
              'Parameter change must be an object with "parameter" and "value" properties'
            );
          }
          formData.parameterChange = parsed;
        } catch (err) {
          console.error(err);
          throw new Error("Invalid JSON in parameter change");
        }
      }

      const proposal = Proposal.create(
        formData.title,
        formData.forumPostLink,
        formData.summary,
        formData.parameterChange ? JSON.stringify(formData.parameterChange) : ""
      );

      await callSmartContract(
        "submitUpdateProposal",
        governance!.private.address,
        new Args().addSerializable(proposal).serialize(),
        {
          success: "Proposal created successfully",
          pending: "Creating proposal...",
          error: "Failed to create proposal",
        },
        Mas.fromString("1001")
      );

      setFormData({
        title: "",
        forumPostLink: "",
        summary: "",
        parameterChange: undefined,
      });
      setParameterChangeInput("");
    } catch (err) {
      console.error("Error creating proposal:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(parameterChangeInput);
      const formatted = JSON.stringify(parsed, null, 2);
      setParameterChangeInput(formatted);
    } catch (err) {
      console.error("Cannot format invalid JSON");
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

      <div
        className={`p-4 rounded-lg border ${
          hasEnoughMasog
            ? "bg-s-success/10 border-s-success/20"
            : "bg-red-100 border-red-300"
        }`}
      >
        <div className="flex items-start gap-3">
          <InformationCircleIcon
            className={`h-5 w-5 mt-0.5 ${
              hasEnoughMasog ? "text-s-success" : "text-red-500"
            }`}
          />
          <div>
            <h2
              className={`text-sm font-medium mb-1 ${
                hasEnoughMasog ? "text-s-success" : "text-red-600"
              }`}
            >
              {hasEnoughMasog
                ? "You have enough MASOG to create a proposal"
                : "Insufficient MASOG balance"}
            </h2>
            <p className="text-f-tertiary mas-body2">
              Your balance:{" "}
              <span
                className={!hasEnoughMasog ? "text-red-500 font-medium" : ""}
              >
                {userMasogBalance.toString()}
              </span>{" "}
              MASOG
              <br />
              Required balance: {REQUIRED_MASOG.toString()} MASOG
            </p>
          </div>
        </div>
      </div>

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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
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
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    forumPostLink: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-f-primary focus:outline-none focus:ring-2 focus:ring-brand/30 mas-body"
                required
                placeholder="https://forum.massa.net/..."
              />
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, summary: e.target.value }))
                }
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
                  value={parameterChangeInput}
                  onChange={(e) => setParameterChangeInput(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand/30 text-f-primary"
                  placeholder='{
  "parameter": "example_param",
  "value": "example_value"
}'
                  spellCheck="false"
                />
              </div>
            </div>
          </div>

          {/* Submit Section */}
          <div className="pt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-f-tertiary">
              <InformationCircleIcon className="h-5 w-5" />
              <div className="mas-body2">
                <p>Cost: 1000 MAS</p>
                <p>Required MASOG Balance: {REQUIRED_MASOG.toString()}</p>
              </div>
            </div>
            <button
              type="submit"
              className={`px-6 py-2 rounded-lg mas-buttons transition-all duration-200 ${
                loading || !hasEnoughMasog
                  ? "bg-tertiary text-f-tertiary cursor-not-allowed"
                  : "bg-brand text-neutral hover:opacity-90 active-button"
              }`}
              disabled={loading || !hasEnoughMasog}
            >
              {loading ? "Creating..." : "Create Proposal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
