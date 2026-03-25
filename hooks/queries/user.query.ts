/* NEXT */
import { dehydrate, useQuery } from "@tanstack/react-query";

/* CONSTANTS */
import { CACHE_KEY_USER } from "@/constants/query-keys";
import { STALE_TIME } from "@/constants";

/* UTILITIES */
import getQueryClient from "@/lib/get-query-client";

/* ACTIONS */
import { getUserProfile } from "@/actions/user.actions";

/**
 * DOCU: Will prefetch the current user's profile data for SSR. <br>
 * Triggered: On load of the profile page. <br>
 * Last Updated: March 25, 2026
 * @author Jhones
 */
export const prefetchUserProfile = async () => {
	const queryClient = getQueryClient();

	await queryClient.prefetchQuery({
		queryKey: CACHE_KEY_USER,
		queryFn: () => getUserProfile(),
		staleTime: STALE_TIME,
	});

	return dehydrate(queryClient);
};

/**
 * DOCU: Will get the current user's profile data. <br>
 * Triggered: On load of the profile page. <br>
 * Last Updated: March 25, 2026
 * @author Jhones
 */
export const useGetUserProfile = () => {
	const { data: user_profile, ...rest } = useQuery({
		queryKey: CACHE_KEY_USER,
		queryFn: () => getUserProfile(),
		staleTime: STALE_TIME,
	});

	return { user_profile, ...rest };
};
