export const SocialLink = ({
    href,
    icon,
}: {
    href: string;
    icon: React.ReactNode;
}) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-neutral dark:text-white hover:opacity-80 transition-opacity"
    >
        {icon}
    </a>
);
