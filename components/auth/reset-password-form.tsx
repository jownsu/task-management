"use client";

/* NEXT */
import Link from "next/link";
import { useSearchParams } from "next/navigation";

/* REACT */
import { useState, useCallback } from "react";

/* COMPONENTS */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import KanbanIcon from "@/components/kanban-icon";

/* PLUGINS */
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";

/* SCHEMA */
import { ResetPasswordSchema, reset_password_schema } from "@/schema/auth-schema";

/* ACTIONS */
import { resetPassword } from "@/actions/auth.actions";

/* UTILITIES */
import { executeAction } from "@/lib/execute-action";

/* ICONS */
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

/**
 * DOCU: This component renders the reset password form with new password and confirm fields. <br>
 * Reads the reset token from URL search params. <br>
 * Triggered: Rendered on the reset password page. <br>
 * Last Updated: April 02, 2026
 * @author Jhones
 */
const ResetPasswordForm = () => {
	const search_params = useSearchParams();
	const token = search_params.get("token");

	const [error, setError] = useState<string | null>(null);
	const [is_loading, setIsLoading] = useState(false);
	const [is_reset, setIsReset] = useState(false);
	const [show_password, setShowPassword] = useState(false);
	const [show_confirm_password, setShowConfirmPassword] = useState(false);

	const togglePasswordVisibility = useCallback(() => setShowPassword((prev) => !prev), []);
	const toggleConfirmPasswordVisibility = useCallback(() => setShowConfirmPassword((prev) => !prev), []);

	const form = useForm<ResetPasswordSchema>({
		resolver: zodResolver(reset_password_schema),
		defaultValues: {
			token: token ?? "",
			password: "",
			confirm_password: "",
		},
	});

	const errors = form.formState.errors;

	/**
	 * DOCU: Handles the reset password form submission. <br>
	 * Triggered: When the user submits the reset password form. <br>
	 * Last Updated: April 02, 2026
	 * @author Jhones
	 */
	const onResetPasswordSubmit: SubmitHandler<ResetPasswordSchema> = async (data) => {
		setError(null);
		setIsLoading(true);

		try {
			await executeAction(resetPassword(data));
			setIsReset(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	/* Show error if no token in URL */
	if (!token) {
		return (
			<Card className="mx-auto flex w-full max-w-[560] flex-col items-center gap-[21] border-none">
				<CardTitle className="t-[21]">
					<KanbanIcon />
				</CardTitle>
				<CardContent className="flex w-full flex-col items-center gap-[24]">
					<div className="flex flex-col items-center gap-[8]">
						<h1 className="!text-h-lg">Invalid reset link</h1>
						<p className="text-medium-grey !text-b-lg text-center">This password reset link is invalid. Please request a new one.</p>
					</div>
					<Button asChild className="h-[53] w-full rounded-lg text-md">
						<Link href="/forgot-password">Request new link</Link>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="mx-auto flex w-full max-w-[560] flex-col items-center gap-[21] border-none">
			<CardTitle className="t-[21]">
				<KanbanIcon />
			</CardTitle>
			<CardContent className="flex w-full flex-col gap-[12]">
				{is_reset ? (
					<div className="flex flex-col items-center gap-[24]">
						<div className="flex flex-col items-center gap-[8]">
							<h1 className="!text-h-lg">Password reset!</h1>
							<p className="text-medium-grey !text-b-lg text-center">Your password has been successfully reset. You can now log in with your new password.</p>
						</div>
						<Button asChild className="h-[53] w-full rounded-lg text-md">
							<Link href="/login">Go to login</Link>
						</Button>
					</div>
				) : (
					<>
						<div className="flex flex-col gap-[8] mb-[12]">
							<h1 className="!text-h-lg">Reset your password</h1>
							<p className="text-medium-grey !text-b-lg">Enter your new password below.</p>
						</div>
						<Form {...form}>
							<form className="flex flex-col gap-[24]" onSubmit={form.handleSubmit(onResetPasswordSubmit)}>
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>New password</FormLabel>
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
											<FormLabel>Confirm password</FormLabel>
											<div className="relative">
												<Input {...field} type={show_confirm_password ? "text" : "password"} placeholder="Confirm your new password" error={errors.confirm_password?.message} className="pr-[40]" />
												<button type="button" className="text-medium-grey hover:text-black dark:hover:text-white absolute top-[10] right-[12] transition-colors" onClick={toggleConfirmPasswordVisibility} tabIndex={-1}>
													{show_confirm_password ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
												</button>
											</div>
										</FormItem>
									)}
								/>

								{error && <p className="text-destructive !text-b-lg text-center">{error}</p>}

								<Button type="submit" className="h-[53] w-full rounded-lg text-md" disabled={is_loading}>
									{is_loading ? "Resetting..." : "Reset password"}
								</Button>
							</form>
						</Form>
					</>
				)}
			</CardContent>
		</Card>
	);
};

export default ResetPasswordForm;
