/* COMPONENTS */
import IconKanban from "@/components/kanban-icon";
import MainContainer from "@/components/main-container";
import { Skeleton } from "@/components/ui/skeleton";

/* UTILITIES */
import { cn } from "@/lib/utils";

const BoardLoadingPage = () => {
	return (
		<div>
			<div className="bg-foreground fixed z-[99] flex h-[64] w-full justify-between px-[24] md:h-[81] lg:h-[96]">
				<div className="hidden items-center gap-[24] md:flex">
					<div className={cn("border-background flex border-r-2 pr-[24] pr-[109] lg:pr-[149]")}>
						<IconKanban />
					</div>
					<Skeleton className="h-8 w-64" />
				</div>
			</div>
			<MainContainer>
				<div className="flex w-full gap-6 p-6">
					<div className="flex w-[280] flex-col gap-6">
						<Skeleton className="h-8" />
						<Skeleton className="h-20" />
						<Skeleton className="h-24" />
						<Skeleton className="h-36" />
					</div>
					<div className="flex w-[280] flex-col gap-6">
						<Skeleton className="h-8" />
						<Skeleton className="h-18" />
						<Skeleton className="h-22" />
						<Skeleton className="h-28" />
					</div>
					<div className="flex w-[280] flex-col gap-6">
						<Skeleton className="h-8" />
						<Skeleton className="h-24" />
						<Skeleton className="h-28" />
						<Skeleton className="h-32" />
					</div>
				</div>
			</MainContainer>
		</div>
	);
};

export default BoardLoadingPage;
