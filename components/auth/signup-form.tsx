"use client";

/* NEXT */
import Link from "next/link";

/* REACT */
import { useState, useCallback } from "react";

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
import { SignupSchema, signup_schema } from "@/schema/auth-schema";

/* ACTIONS */
import { signupUser } from "@/actions/auth.actions";

/* ICONS */
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

/**
 * DOCU: This component renders the signup form with name, email, password, and confirm password fields. <br>
 * Triggered: Rendered on the signup page. <br>
 * Last Updated: March 25, 2026
 * @author Jhones
 */
const SignupForm = () => {
	const [error, setError] = useState<string | null>(null);
	const [is_loading, setIsLoading] = useState(false);
	const [show_password, setShowPassword] = useState(false);
	const [show_confirm_password, setShowConfirmPassword] = useState(false);

	const togglePasswordVisibility = useCallback(() => setShowPassword((prev) => !prev), []);
	const toggleConfirmPasswordVisibility = useCallback(() => setShowConfirmPassword((prev) => !prev), []);

	const form = useForm<SignupSchema>({
		resolver: zodResolver(signup_schema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirm_password: "",
		},
	});

	const errors = form.formState.errors;

	/**
	 * DOCU: Handles the signup form submission — creates account then auto-logs in. <br>
	 * Triggered: When the user submits the signup form. <br>
	 * Last Updated: March 25, 2026
	 * @author Jhones
	 */
	const onSignupSubmit: SubmitHandler<SignupSchema> = async (data) => {
		setError(null);
		setIsLoading(true);

		const result = await signupUser(data);

		if (result.error) {
			setError(result.error);
			setIsLoading(false);
			return;
		}

		/* Auto-login after successful signup */
		const login_result = await signIn("credentials", {
			email: data.email,
			password: data.password,
			redirect: false,
		});

		if (login_result?.error) {
			setError("Account created but login failed. Please log in manually.");
			setIsLoading(false);
		} else {
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
					<form className="flex flex-col gap-[24]" onSubmit={form.handleSubmit(onSignupSubmit)}>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<Input {...field} type="text" placeholder="e.g. John Doe" error={errors.name?.message} />
								</FormItem>
							)}
						/>

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
									<div className="relative">
										<Input {...field} type={show_password ? "text" : "password"} placeholder="At least 8 characters" error={errors.password?.message} className="pr-[40]" />
										<button type="button" className="text-medium-grey hover:text-black dark:hover:text-white absolute top-[10] right-[12] transition-colors" onClick={togglePasswordVisibility} tabIndex={-1}>
											{show_password ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
										</button>
									</div>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="confirm_password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Confirm Password</FormLabel>
									<div className="relative">
										<Input {...field} type={show_confirm_password ? "text" : "password"} placeholder="Confirm your password" error={errors.confirm_password?.message} className="pr-[40]" />
										<button type="button" className="text-medium-grey hover:text-black dark:hover:text-white absolute top-[10] right-[12] transition-colors" onClick={toggleConfirmPasswordVisibility} tabIndex={-1}>
											{show_confirm_password ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
										</button>
									</div>
								</FormItem>
							)}
						/>

						{error && <p className="text-destructive !text-b-lg text-center">{error}</p>}

						<Button type="submit" className="h-[53] w-full rounded-lg text-md" disabled={is_loading}>
							{is_loading ? "Creating account..." : "Create account"}
						</Button>
					</form>
				</Form>

				<p className="text-medium-grey !text-b-lg mt-[8] text-center">
					Already have an account?{" "}
					<Link href="/login" className="text-primary hover:text-primary-foreground font-bold">
						Log in
					</Link>
				</p>
			</CardContent>
		</Card>
	);
};

export default SignupForm;
