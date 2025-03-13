import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, HomeIcon } from "@heroicons/react/24/outline";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-8xl font-bold text-brand mas-banner">404</h1>
          <h2 className="text-2xl font-semibold text-f-primary mas-title">
            Page Not Found
          </h2>
          <p className="text-f-tertiary mas-body max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-f-tertiary hover:text-brand transition-colors mas-buttons"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Go Back
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 bg-brand text-neutral rounded-lg hover:opacity-90 active-button mas-buttons"
          >
            <HomeIcon className="h-5 w-5" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
