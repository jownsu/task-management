/* PLUGINS */
import { DiGithubBadge } from "react-icons/di";

const Logo = () => {
	return (
		<div className="text-card flex items-center gap-[8]">
			<DiGithubBadge className="size-[32]" />
			<span className="font-bold">Lorem Ipsum</span>
		</div>
	);
};

export default Logo;
