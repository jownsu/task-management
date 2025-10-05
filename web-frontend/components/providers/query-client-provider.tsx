"use client";

/* REACT */
import { PropsWithChildren } from "react";

/* PLUGINS */
import { QueryClientProvider as Provider } from "@tanstack/react-query";

/* UTILITIES */
import getQueryClient from "@/lib/get-query-client";

const QueryClientProvider = ({ children }: PropsWithChildren) => {
	const queryClient = getQueryClient();

	return <Provider client={queryClient}>{children}</Provider>;
};

export default QueryClientProvider;
