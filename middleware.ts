import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protected_paths = ["/profile", "/"];

export async function middleware(request: NextRequest) {
	const token = await getToken({ 
        req: request,
        secret: process.env.AUTH_SECRET
    });

	const pathname = request.nextUrl.pathname;

	const is_protected = protected_paths.some((path) => pathname === path);

	if (is_protected && !token) {
		const login_url = new URL("/login", request.url);
		login_url.searchParams.set("callbackUrl", request.nextUrl.pathname);
		return NextResponse.redirect(login_url);
	}

	if(token && pathname === "/login"){
		return NextResponse.redirect(new URL("/", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/login",
		"/profile/:path*",
		"/"
	]
};
