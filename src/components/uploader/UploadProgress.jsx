import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Loader2, Upload } from "lucide-react";

import { Progress } from "@/components/ui/progress";

function UploadProgress({ status, progress }) {
  const showProgress = status === "uploading" || status === "success" || status === "error";

  return (
    <AnimatePresence>
      {showProgress ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground flex items-center gap-2">
              {status === "uploading" ? (
                <Loader2 className="size-4 animate-spin text-primary" />
              ) : status === "success" ? (
                <CheckCircle className="size-4 text-emerald-500" />
              ) : status === "error" ? (
                <AlertTriangle className="size-4 text-destructive" />
              ) : (
                <Upload className="size-4 text-primary" />
              )}
              <span>
                {status === "uploading" && "Mengunggah file..."}
                {status === "success" && "Upload selesai"}
                {status === "error" && "Upload gagal"}
              </span>
            </div>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} aria-label="Upload progress" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default UploadProgress;
