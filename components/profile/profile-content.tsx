"use client";

/* PLUGINS */
import { toast } from "sonner";

/* COMPONENTS */
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/* PLUGINS */
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";

/* QUERIES */
import { useGetUserProfile } from "@/hooks/queries/user.query";

/* MUTATIONS */
import { useUpdateUserName } from "@/hooks/mutations/user.mutation";
import { useChangePassword } from "@/hooks/mutations/user.mutation";

/* SCHEMA */
import { update_name_schema, change_password_schema } from "@/schema/profile-schema";
import type { UpdateNameSchema, ChangePasswordSchema } from "@/schema/profile-schema";

/* ICONS */
import { LuUser, LuLock, LuChartBar } from "react-icons/lu";

/**
 * DOCU: This function extracts initials from a user's name. <br>
 * Triggered: When the user has no avatar image. <br>
 * Last Updated: March 25, 2026
 * @author Jhones
 */
const getInitials = (name: string) => {
	const words = name.trim().split(/\s+/);
	return words
		.slice(0, 2)
		.map((word) => word[0].toUpperCase())
		.join("");
};

/**
 * DOCU: This component renders the profile page content with user info, statistics, and forms. <br>
 * Triggered: Rendered in the profile page. <br>
 * Last Updated: March 25, 2026
 * @author Jhones
 */
const ProfileContent = () => {
	const { user_profile } = useGetUserProfile();

	const name_form = useForm<UpdateNameSchema>({
		resolver: zodResolver(update_name_schema),
		defaultValues: {
			name: user_profile?.name || "",
		},
	});

	const password_form = useForm<ChangePasswordSchema>({
		resolver: zodResolver(change_password_schema),
		defaultValues: {
			current_password: "",
			new_password: "",
			confirm_password: "",
		},
	});

	const { updateName, isPending: is_name_pending } = useUpdateUserName({
		onSuccess: () => {
			toast.success("Name updated successfully!");
		},
	});

	const { changeUserPassword, isPending: is_password_pending } = useChangePassword({
		onSuccess: () => {
			toast.success("Password changed successfully!");
			password_form.reset();
		},
		onError: (error_msg) => {
			toast.error(error_msg || "Failed to change password");
		},
	});

	/**
	 * DOCU: Handles name update form submission. <br>
	 * Triggered: When the user submits the edit profile form. <br>
	 * Last Updated: March 25, 2026
	 * @author Jhones
	 */
	const onNameSubmit: SubmitHandler<UpdateNameSchema> = (data) => {
		updateName(data);
	};

	/**
	 * DOCU: Handles password change form submission. <br>
	 * Triggered: When the user submits the change password form. <br>
	 * Last Updated: March 25, 2026
	 * @author Jhones
	 */
	const onPasswordSubmit: SubmitHandler<ChangePasswordSchema> = (data) => {
		changeUserPassword(data);
	};

	if (!user_profile) return null;

	const display_name = user_profile.name || "User";
	const member_since = new Date(user_profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });
	const provider_label = user_profile.provider ? user_profile.provider.charAt(0).toUpperCase() + user_profile.provider.slice(1) : null;

	const stats = [
		{ label: "Boards", value: user_profile.stats.total_boards, color: "text-primary" },
		{ label: "Columns", value: user_profile.stats.total_columns, color: "text-primary" },
		{ label: "Tasks", value: user_profile.stats.total_tasks, color: "text-primary" },
		{ label: "Subtasks", value: user_profile.stats.total_subtasks, color: "text-primary" },
		{ label: "Completed", value: user_profile.stats.completed_subtasks, color: "text-emerald-500" },
		{ label: "Completion", value: `${user_profile.stats.completion_rate}%`, color: "text-emerald-500" },
	];

	return (
		<div className="mx-auto w-full max-w-[700] p-[24]">
			{/* Profile Header */}
			<div className="mb-[24] flex items-center gap-[16] rounded-xl bg-primary p-[24] text-white">
				<Avatar className="size-[64] shrink-0">
					{user_profile.image && <AvatarImage src={user_profile.image} alt={display_name} />}
					<AvatarFallback className="bg-white/20 text-white !text-h-lg font-bold">{getInitials(display_name)}</AvatarFallback>
				</Avatar>
				<div className="flex flex-col">
					<span className="!text-h-lg font-bold">{display_name}</span>
					<span className="!text-b-md opacity-80">{user_profile.email}</span>
					<span className="!text-b-sm opacity-60">Member since {member_since}</span>
				</div>
			</div>

			{/* Statistics Grid */}
			<div className="mb-[24]">
				<div className="mb-[12] flex items-center gap-[8]">
					<LuChartBar size={16} className="text-medium-grey" />
					<span className="!text-b-sm font-semibold uppercase tracking-wider text-medium-grey">Statistics</span>
				</div>
				<div className="grid grid-cols-2 gap-[12] md:grid-cols-3">
					{stats.map((stat) => (
						<div key={stat.label} className="rounded-lg border border-lines bg-foreground p-[16] text-center">
							<div className={`!text-h-xl font-bold ${stat.color}`}>{stat.value}</div>
							<div className="!text-b-sm text-medium-grey">{stat.label}</div>
						</div>
					))}
				</div>
			</div>

			{/* Forms Row */}
			<div className="grid grid-cols-1 gap-[24] md:grid-cols-2">
				{/* Edit Profile Form */}
				<div className="rounded-lg border border-lines bg-foreground p-[20]">
					<div className="mb-[16] flex items-center gap-[8]">
						<LuUser size={16} className="text-medium-grey" />
						<span className="!text-b-sm font-semibold uppercase tracking-wider text-medium-grey">Edit Profile</span>
					</div>

					<Form {...name_form}>
						<form className="flex flex-col gap-[16]" onSubmit={name_form.handleSubmit(onNameSubmit)}>
							<FormField
								control={name_form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<Input {...field} type="text" placeholder="Enter your name" error={name_form.formState.errors.name?.message} />
									</FormItem>
								)}
							/>

							<FormItem>
								<FormLabel>Email</FormLabel>
								<Input type="email" value={user_profile.email} disabled className="opacity-60" />
							</FormItem>

							<Button type="submit" className="w-full" disabled={is_name_pending}>
								{is_name_pending ? "Saving..." : "Save Changes"}
							</Button>
						</form>
					</Form>
				</div>

				{/* Change Password / OAuth Message */}
				<div className="rounded-lg border border-lines bg-foreground p-[20]">
					<div className="mb-[16] flex items-center gap-[8]">
						<LuLock size={16} className="text-medium-grey" />
						<span className="!text-b-sm font-semibold uppercase tracking-wider text-medium-grey">Change Password</span>
					</div>

					{user_profile.has_password ? (
						<Form {...password_form}>
							<form className="flex flex-col gap-[16]" onSubmit={password_form.handleSubmit(onPasswordSubmit)}>
								<FormField
									control={password_form.control}
									name="current_password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Current Password</FormLabel>
											<Input {...field} type="password" placeholder="Enter current password" error={password_form.formState.errors.current_password?.message} />
										</FormItem>
									)}
								/>

								<FormField
									control={password_form.control}
									name="new_password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>New Password</FormLabel>
											<Input {...field} type="password" placeholder="Enter new password" error={password_form.formState.errors.new_password?.message} />
										</FormItem>
									)}
								/>

								<FormField
									control={password_form.control}
									name="confirm_password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Confirm Password</FormLabel>
											<Input {...field} type="password" placeholder="Confirm new password" error={password_form.formState.errors.confirm_password?.message} />
										</FormItem>
									)}
								/>

								<Button type="submit" className="w-full" disabled={is_password_pending}>
									{is_password_pending ? "Updating..." : "Update Password"}
								</Button>
							</form>
						</Form>
					) : (
						<div className="flex flex-col items-center justify-center py-[32] text-center">
							<p className="!text-b-lg text-medium-grey">You signed in with {provider_label}</p>
							<p className="!text-b-sm mt-[8] text-medium-grey/60">Password management is not available for OAuth accounts.</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ProfileContent;
