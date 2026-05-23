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

/* SCHEMA */
import { ForgotPasswordSchema, forgot_password_schema } from "@/schema/auth-schema";

/* ACTIONS */
import { forgotPassword } from "@/actions/auth.actions";

/* UTILITIES */
import { executeAction } from "@/lib/execute-action";

/* ICONS */
import { HiOutlineArrowLeft } from "react-icons/hi";

/**
 * DOCU: This component renders the forgot password form with email input. <br>
 * Shows a success message after submission regardless of whether the email exists. <br>
 * Triggered: Rendered on the forgot password page. <br>
 * Last Updated: April 02, 2026
 * @author Jhones
 */
const ForgotPasswordForm = () => {
	const [error, setError] = useState<string | null>(null);
	const [is_loading, setIsLoading] = useState(false);
	const [is_sent, setIsSent] = useState(false);

	const form = useForm<ForgotPasswordSchema>({
		resolver: zodResolver(forgot_password_schema),
		defaultValues: {
			email: "",
		},
	});

	const errors = form.formState.errors;

	/**
	 * DOCU: Handles the forgot password form submission. <br>
	 * Triggered: When the user submits the forgot password form. <br>
	 * Last Updated: April 02, 2026
	 * @author Jhones
	 */
	const onForgotPasswordSubmit: SubmitHandler<ForgotPasswordSchema> = async (data) => {
		setError(null);
		setIsLoading(true);

		try {
			await executeAction(forgotPassword(data));
			setIsSent(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="mx-auto flex w-full max-w-[560] flex-col items-center gap-[21] border-none">
			<CardTitle className="t-[21]">
				<FlowBoardIcon />
			</CardTitle>
			<CardContent className="flex w-full flex-col gap-[12]">
				{is_sent ? (
					<div className="flex flex-col items-center gap-[24]">
						<div className="flex flex-col items-center gap-[8]">
							<h1 className="!text-h-lg">Check your email</h1>
							<p className="text-medium-grey !text-b-lg text-center">If an account exists with that email, we&apos;ve sent a password reset link. Please check your inbox and spam folder.</p>
						</div>
						<Button asChild className="h-[53] w-full rounded-lg text-md">
							<Link href="/login">Back to login</Link>
						</Button>
					</div>
				) : (
					<>
						<div className="flex flex-col gap-[8] mb-[12]">
							<h1 className="!text-h-lg">Forgot password?</h1>
							<p className="text-medium-grey !text-b-lg">Enter your email and we&apos;ll send you a link to reset your password.</p>
						</div>
						<Form {...form}>
							<form className="flex flex-col gap-[24]" onSubmit={form.handleSubmit(onForgotPasswordSubmit)}>
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

								{error && <p className="text-destructive !text-b-lg text-center">{error}</p>}

								<Button type="submit" className="h-[53] w-full rounded-lg text-md" disabled={is_loading}>
									{is_loading ? "Sending..." : "Send reset link"}
								</Button>
							</form>
						</Form>

						<Link href="/login" className="text-medium-grey hover:text-primary !text-b-lg mt-[8] flex items-center justify-center gap-[8] transition-colors">
							<HiOutlineArrowLeft size={16} />
							Back to login
						</Link>
					</>
				)}
			</CardContent>
		</Card>
	);
};

export default ForgotPasswordForm;
