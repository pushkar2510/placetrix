import { TeamModern } from "@/components/team-modern";
import { HeaderWrapper } from "@/components/header-wrapper";
import { Footer } from "@/components/footer";

const OurTeamPage = () => {
	return (
		<div className="relative flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
			<HeaderWrapper />
			<main className="flex-1">
				<TeamModern />
			</main>
			<Footer />
		</div>
	);
};

export default OurTeamPage;
