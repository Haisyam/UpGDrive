import { Loader2, RotateCcw, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function UploadActions({ canUpload, isUploading, disableReason, onUpload, onReset, onCancel }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button onClick={onUpload} disabled={!canUpload || isUploading} className="min-w-[7.5rem]">
              {isUploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  Upload
                </>
              )}
            </Button>
          </span>
        </TooltipTrigger>
        {!canUpload && disableReason ? <TooltipContent>{disableReason}</TooltipContent> : null}
      </Tooltip>

      {isUploading ? (
        <Button variant="outline" onClick={onCancel}>
          <X className="size-4" />
          Cancel
        </Button>
      ) : (
        <Button variant="secondary" onClick={onReset}>
          <RotateCcw className="size-4" />
          Reset
        </Button>
      )}
    </div>
  );
}

export default UploadActions;
