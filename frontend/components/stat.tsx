"use client";

import * as React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function Stat({
	label,
	value,
	icon: Icon,
	help,
	className,
}: {
	label: string;
	value: React.ReactNode;
	icon?: React.ElementType;
	help?: string;
	className?: string;
}) {
	const content = (
		<div className={"space-y-1 " + (className ?? "") }>
			<p className="text-xs text-muted-foreground flex items-center gap-1">
				{Icon ? <Icon className="h-3 w-3" /> : null}
				{label}
			</p>
			<div className="text-xl font-semibold leading-none">{value}</div>
		</div>
	);

	if (!help) return content;

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<div>{content}</div>
				</TooltipTrigger>
				<TooltipContent>
					<p className="max-w-[260px] text-xs">{help}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
