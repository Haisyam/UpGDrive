import { Toaster as Sonner } from "sonner";

function Toaster(props) {
  return (
    <Sonner
      toastOptions={{
        classNames: {
          toast: "bg-card text-card-foreground border border-border",
          title: "text-sm font-medium",
          description: "text-xs text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
