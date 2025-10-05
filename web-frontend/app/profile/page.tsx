import { auth } from "@/server/auth";

const ProfilePage = async () => {
	const session = await auth();

	return (
		<div className="container">
			<h1>Hello {session?.user.name}</h1>
		</div>
	);
};

export default ProfilePage;
