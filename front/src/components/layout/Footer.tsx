import { SocialLink } from "./SocialLink"
import { socialLinks } from "./socialLinksData"

export const Footer = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
                <div className="text-xl text-neutral dark:text-white">
                    <div className="font-normal">MASSA</div>
                    <div className="font-normal">GOVERNANCE</div>
                </div>
                <div className="flex items-center space-x-6">
                    {socialLinks.map((link) => (
                        <SocialLink key={link.href} href={link.href} icon={link.icon} />
                    ))}
                </div>
            </div>
        </div>
    )
}