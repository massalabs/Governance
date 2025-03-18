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
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-f-primary dark:text-darkText bg-gradient-to-r from-primary dark:from-darkAccent to-primary/80 dark:to-darkAccent/80 bg-clip-text text-transparent">
          Basic Information
        </h2>
        <p className="text-f-tertiary dark:text-darkMuted text-sm">
          Provide the essential details about your proposal
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-f-primary dark:text-darkText mas-body2 mb-2 font-medium"
          >
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-4 py-3 bg-secondary/60 dark:bg-darkCard/60 border border-primary/10 dark:border-darkAccent/10 rounded-lg text-f-primary dark:text-darkText placeholder-f-tertiary dark:placeholder-darkMuted focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-darkAccent/20 focus:border-primary/30 dark:focus:border-darkAccent/30 mas-body transition-all duration-200"
            required
            maxLength={100}
            placeholder="Enter a clear and concise title"
          />
        </div>

        <div>
          <label
            htmlFor="forumPostLink"
            className="block text-f-primary dark:text-darkText mas-body2 mb-2 font-medium"
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
            className="w-full px-4 py-3 bg-secondary/60 dark:bg-darkCard/60 border border-primary/10 dark:border-darkAccent/10 rounded-lg text-f-primary dark:text-darkText placeholder-f-tertiary dark:placeholder-darkMuted focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-darkAccent/20 focus:border-primary/30 dark:focus:border-darkAccent/30 mas-body transition-all duration-200"
            required
            placeholder="https://forum.massa.net/..."
          />
        </div>

        <div>
          <label
            htmlFor="summary"
            className="block text-f-primary dark:text-darkText mas-body2 mb-2 font-medium"
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
            className="w-full px-4 py-3 bg-secondary/60 dark:bg-darkCard/60 border border-primary/10 dark:border-darkAccent/10 rounded-lg text-f-primary dark:text-darkText placeholder-f-tertiary dark:placeholder-darkMuted focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-darkAccent/20 focus:border-primary/30 dark:focus:border-darkAccent/30 mas-body resize-none transition-all duration-200"
            required
            maxLength={500}
            placeholder="Provide a brief summary of your proposal"
          />
          <p className="mt-2 text-right text-f-tertiary dark:text-darkMuted mas-caption">
            {formData.summary.length}/500 characters
          </p>
        </div>
      </div>
    </div>
  );
}
