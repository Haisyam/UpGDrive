import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid gap-1 has-[>svg]:grid-cols-[1rem_1fr] has-[>svg]:gap-x-3 has-[>svg]:items-start has-[>svg]:[&>[data-slot=alert-title]]:col-start-2 has-[>svg]:[&>[data-slot=alert-description]]:col-start-2 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive: "border-destructive/50 bg-card text-destructive [&>svg]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({ className, variant, ...props }) {
  return <div role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

function AlertTitle({ className, ...props }) {
  return (
    <h5
      data-slot="alert-title"
      className={cn("line-clamp-1 min-h-4 font-medium tracking-tight", className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-muted-foreground grid justify-items-start gap-1 text-sm", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
