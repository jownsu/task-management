import { getStaleTimeMins } from "@/lib/utils";
import { isServer, QueryClient } from "@tanstack/react-query";

/**
 * This function creates a new instance of QueryClient with default options for queries and mutations. <br>
 * It sets a default staleTime to avoid immediate refetching on the client and defines retry logic for specific errors. <br>
 */
function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				refetchOnWindowFocus: false,
				staleTime: getStaleTimeMins(5),

			}
		}
	});
}

let browserQueryClient: QueryClient | undefined = undefined;

const getQueryClient = () => {
	if (isServer) {
		/* Server: always make a new query client */
		return makeQueryClient();
	} 
	else {
		if (!browserQueryClient) {
			/*
			 * Browser: make a new query client if we don't already have one
			 * This is very important, so we don't re-make a new client if React
			 * suspends during the initial render. This may not be needed if we
			 * have a suspense boundary BELOW the creation of the query client
			 */
			browserQueryClient = makeQueryClient();
		}
		return browserQueryClient;
	}
};

export default getQueryClient;
