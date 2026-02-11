import { Upload, FileText, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function FilePicker({ file, accept, disabled = false, onFileSelected }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const openFileDialog = () => {
    if (disabled) {
      return;
    }
    inputRef.current?.click();
  };

  const handleSelection = (files) => {
    const selected = files?.[0];
    if (!selected) {
      return;
    }
    onFileSelected(selected);
  };

  const onDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    if (disabled) {
      return;
    }

    handleSelection(event.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        aria-label="Pilih file untuk di-upload"
        onChange={(event) => handleSelection(event.target.files)}
      />

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={!disabled ? { scale: 1.01 } : undefined}
        transition={{ duration: 0.2 }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={openFileDialog}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFileDialog();
          }
        }}
        onDrop={onDrop}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) {
            setIsDragging(true);
          }
        }}
        onDragLeave={() => setIsDragging(false)}
        className={cn(
          "rounded-xl border-2 border-dashed p-6 text-center transition-colors",
          "bg-card/70 backdrop-blur-sm",
          disabled && "cursor-not-allowed opacity-60",
          isDragging ? "border-primary bg-primary/8" : "border-border hover:border-primary/50",
        )}
      >
        <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Upload className="size-5" aria-hidden="true" />
        </div>

        <p className="text-sm font-medium">Pilih file atau drag & drop di sini</p>
        <p className="text-muted-foreground mt-1 text-xs">
          Format: Word, Excel, PDF, PNG, JPG, JPEG, WEBP, GIF (maks. 30MB)
        </p>

        {file ? (
          <div className="mt-3 flex justify-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <FileText className="size-3.5" />
              1 file dipilih
            </Badge>
            {file.type.startsWith("image/") && (
              <Badge variant="outline" className="gap-1">
                <ImageIcon className="size-3.5" />
                Gambar
              </Badge>
            )}
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}

export default FilePicker;
