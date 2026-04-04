/* REACT */
import { Suspense } from "react";

/* COMPONENTS */
import ResetPasswordForm from "@/components/auth/reset-password-form";

/**
 * DOCU: Reset password page wrapper. Uses Suspense because ResetPasswordForm reads useSearchParams(). <br>
 * Triggered: When a user clicks the password reset link from their email. <br>
 * Last Updated: April 02, 2026
 * @author Jhones
 */
const ResetPasswordPage = () => {
	return (
		<div className="flex min-h-screen w-full items-center justify-center px-[16]">
			<Suspense>
				<ResetPasswordForm />
			</Suspense>
		</div>
	);
};

export default ResetPasswordPage;
