import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login"];

export const proxy = auth((request) => {
	const { nextUrl } = request;
	const is_logged_in = !!request.auth;
	const is_public_route = PUBLIC_ROUTES.includes(nextUrl.pathname);

	/* Redirect logged-in users away from login page */
	if (is_logged_in && is_public_route) {
		return NextResponse.redirect(new URL("/", nextUrl));
	}

	/* Redirect unauthenticated users to login page */
	if (!is_logged_in && !is_public_route) {
		return NextResponse.redirect(new URL("/login", nextUrl));
	}

	return NextResponse.next();
});

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico).*)"
	]
};
