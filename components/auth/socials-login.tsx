"use client";

/* NEXT */
import Link from "next/link";

/* REACT */
import { useState } from "react";

/* COMPONENTS */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import FlowBoardIcon from "@/components/flowboard-icon";

/* PLUGINS */
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { signIn } from "next-auth/react";

/* SCHEMA */
import { LoginSchema, login_schema } from "@/schema/auth-schema";

/* ICONS */
import { FcGoogle } from "react-icons/fc";

/**
 * DOCU: This component renders the login form with email/password fields and social login options. <br>
 * Triggered: Rendered on the login page. <br>
 * Last Updated: March 05, 2026
 * @author Jhones
 */
const SocialsLogin = () => {
	const [error, setError] = useState<string | null>(null);
	const [is_loading, setIsLoading] = useState(false);

	const form = useForm<LoginSchema>({
		resolver: zodResolver(login_schema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const errors = form.formState.errors;

	/**
	 * DOCU: Handles the email/password login form submission. <br>
	 * Triggered: When the user submits the login form. <br>
	 * Last Updated: March 05, 2026
	 * @author Jhones
	 */
	const onLoginSubmit: SubmitHandler<LoginSchema> = async (data) => {
		setError(null);
		setIsLoading(true);

		const result = await signIn("credentials", {
			email: data.email,
			password: data.password,
			redirect: false,
		});
		
		if (result?.error) {
			setError("Invalid email or password");
			setIsLoading(false);
		} 
		else {
			window.location.href = "/";
		}
	};

	return (
		<Card className="mx-auto flex w-full max-w-[560] flex-col items-center gap-[21] border-none">
			<CardTitle className="t-[21]">
				<FlowBoardIcon />
			</CardTitle>
			<CardContent className="flex w-full flex-col gap-[12]">
				<Form {...form}>
					<form className="flex flex-col gap-[24]" onSubmit={form.handleSubmit(onLoginSubmit)}>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<Input {...field} type="email" placeholder="e.g. john@example.com" error={errors.email?.message} />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<Input {...field} type="password" placeholder="Enter your password" error={errors.password?.message} />
								</FormItem>
							)}
						/>

						<Link href="/forgot-password" className="text-primary hover:text-primary-foreground !text-b-lg self-end font-bold transition-colors">
							Forgot password?
						</Link>

									{error && <p className="text-destructive !text-b-lg text-center">{error}</p>}

						<Button type="submit" className="h-[53] w-full rounded-lg text-md" disabled={is_loading}>
							{is_loading ? "Logging in..." : "Log in"}
						</Button>
					</form>
				</Form>

				<div className="flex items-center gap-[16] py-[8]">
					<div className="bg-lines h-[1] flex-1" />
					<span className="text-medium-grey !text-b-lg">or</span>
					<div className="bg-lines h-[1] flex-1" />
				</div>

				<Button type="button" variant="secondary" className="flex h-[53] w-full gap-[16] rounded-lg text-md" onClick={() => signIn("google", { redirectTo: "/" })}>
					<FcGoogle size={20} />
					Log in with Google
				</Button>
				<p className="text-medium-grey !text-b-lg mt-[8] text-center">
					Don&apos;t have an account?{" "}
					<Link href="/signup" className="text-primary hover:text-primary-foreground font-bold">
						Sign up
					</Link>
				</p>
			</CardContent>
		</Card>
	);
};

export default SocialsLogin;
