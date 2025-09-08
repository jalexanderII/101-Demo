"use client";

import * as React from "react";
import { Copy } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

export function CopyableField({ label, value }: { label: string; value?: string }) {
	if (!value) return null;

	function onCopy() {
		navigator.clipboard.writeText(value as string).then(() => {
			toast.success(`${label} copied`);
		});
	}

	return (
		<div className="space-y-1 break-words">
			<p className="text-xs text-muted-foreground">{label}</p>
			<div className="flex items-center gap-2">
				<code className="text-xs">{value}</code>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								className="inline-flex h-6 w-6 items-center justify-center rounded-md border bg-background hover:bg-muted"
								onClick={onCopy}
								aria-label={`Copy ${label}`}
							>
								<Copy className="h-3.5 w-3.5" />
							</button>
						</TooltipTrigger>
						<TooltipContent>Copy</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
		</div>
	);
}
