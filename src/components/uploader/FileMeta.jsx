import { FileText, Image as ImageIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { formatBytes } from "@/lib/formatters";
import { getFileCategory } from "@/lib/fileValidators";

function FileMeta({ file }) {
  if (!file) {
    return null;
  }

  const category = getFileCategory(file.name);
  const isImage = file.type.startsWith("image/");
  const Icon = isImage ? ImageIcon : FileText;

  return (
    <Alert className="rounded-xl border-border/80 bg-muted/25">
      <AlertTitle>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="bg-primary/10 text-primary inline-flex size-8 items-center justify-center rounded-full">
              <Icon className="size-4" />
            </span>
            <span>Ringkasan File</span>
          </div>
          <Badge variant="outline" className="rounded-full">
            {category}
          </Badge>
        </div>
      </AlertTitle>
      <AlertDescription className="mt-1 grid gap-1.5 text-sm">
        <p className="flex flex-wrap items-center gap-1">
          <span className="text-muted-foreground">Nama asli:</span>
          <span className="font-medium text-foreground break-all">{file.name}</span>
        </p>
        <p className="flex flex-wrap items-center gap-1">
          <span className="text-muted-foreground">Tipe:</span>
          <span className="font-medium text-foreground break-all">{file.type || "Tidak terdeteksi"}</span>
        </p>
        <p className="flex flex-wrap items-center gap-1">
          <span className="text-muted-foreground">Ukuran:</span>
          <span className="font-medium text-foreground">{formatBytes(file.size)}</span>
        </p>
      </AlertDescription>
    </Alert>
  );
}

export default FileMeta;
