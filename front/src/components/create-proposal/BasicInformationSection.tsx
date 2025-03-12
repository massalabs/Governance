import { CreateProposalParams } from "../../types/governance";

interface BasicInformationSectionProps {
  formData: CreateProposalParams;
  setFormData: (data: CreateProposalParams) => void;
}

export function BasicInformationSection({
  formData,
  setFormData,
}: BasicInformationSectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-f-primary mas-h2">Basic Information</h2>

      <div>
        <label htmlFor="title" className="block text-f-primary mas-body2 mb-2">
          Title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            setFormData({ ...formData, forumPostLink: e.target.value })
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
            setFormData({ ...formData, summary: e.target.value })
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
  );
}
