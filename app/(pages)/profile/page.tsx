/* COMPONENTS */
import ProfileContent from "@/components/profile/profile-content";
import Navbar from "@/components/navigation/navbar";
import MainContainer from "@/components/main-container";

/* PLUGINS */
import { HydrationBoundary } from "@tanstack/react-query";

/* QUERIES */
import { prefetchUserProfile } from "@/hooks/queries/user.query";

const ProfilePage = async () => {
	const prefetched_user = await prefetchUserProfile();

	return (
		<HydrationBoundary state={prefetched_user}>
			<Navbar />

			<MainContainer>
				<div className="h-full overflow-auto">
					<ProfileContent />
				</div>
			</MainContainer>
		</HydrationBoundary>
	);
};

export default ProfilePage;
