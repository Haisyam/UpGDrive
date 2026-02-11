import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Copy, ExternalLink, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import FilePicker from "@/components/uploader/FilePicker";
import FileMeta from "@/components/uploader/FileMeta";
import UploadProgress from "@/components/uploader/UploadProgress";
import UploadActions from "@/components/uploader/UploadActions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ACCEPT_ATTRIBUTE, validateFile } from "@/lib/fileValidators";
import {
  buildRenamedFilename,
  sanitizeFileBaseName,
  stripFileExtension,
} from "@/lib/formatters";
import { uploadToAppScript } from "@/services/appscriptUpload";

const SUPPORTED_BADGES = ["Word", "Excel", "PDF", "Image"];

function UploadCard() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [newFileName, setNewFileName] = useState("");
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const [result, setResult] = useState(null);

  const abortControllerRef = useRef(null);
  const progressTimerRef = useRef(null);

  const hasRenameError = Boolean(selectedFile && !newFileName.trim());
  const hasUnchangedNameError = Boolean(
    selectedFile &&
      sanitizeFileBaseName(newFileName).toLowerCase() ===
        sanitizeFileBaseName(stripFileExtension(selectedFile.name)).toLowerCase(),
  );

  const disableReason = useMemo(() => {
    if (!selectedFile) {
      return "Pilih file terlebih dahulu.";
    }
    if (validationErrors.length > 0) {
      return validationErrors[0];
    }
    if (hasRenameError) {
      return "Nama file baru wajib diisi.";
    }
    if (hasUnchangedNameError) {
      return "Nama file baru harus berbeda dari nama file asli.";
    }
    return "";
  }, [hasRenameError, hasUnchangedNameError, selectedFile, validationErrors]);

  const canUpload = Boolean(
    selectedFile &&
      validationErrors.length === 0 &&
      !hasRenameError &&
      !hasUnchangedNameError &&
      status !== "uploading",
  );

  const stopProgressSimulation = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const startProgressSimulation = () => {
    stopProgressSimulation();
    setProgress(8);

    progressTimerRef.current = setInterval(() => {
      setProgress((current) => {
        if (current >= 92) {
          return 92;
        }
        const delta = Math.floor(Math.random() * 7) + 2;
        return Math.min(current + delta, 92);
      });
    }, 260);
  };

  const handleReset = () => {
    abortControllerRef.current?.abort();
    stopProgressSimulation();

    setSelectedFile(null);
    setNewFileName("");
    setStatus("idle");
    setProgress(0);
    setValidationErrors([]);
    setUploadError("");
    setResult(null);
  };

  const handleFileSelected = (file) => {
    const validation = validateFile(file);

    setSelectedFile(file);
    setNewFileName(stripFileExtension(file.name));
    setValidationErrors(validation.errors);
    setUploadError("");
    setResult(null);
    setProgress(0);
    setStatus(validation.valid ? "ready" : "error");
  };

  const handleUpload = async () => {
    if (!canUpload || !selectedFile) {
      return;
    }

    setStatus("uploading");
    setUploadError("");
    startProgressSimulation();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await uploadToAppScript({
        file: selectedFile,
        newName: newFileName,
        signal: controller.signal,
      });

      stopProgressSimulation();
      setProgress(100);
      setStatus("success");
      setResult(response);
      toast.success("Upload berhasil ke Google Drive.");
    } catch (error) {
      stopProgressSimulation();

      if (error.name === "AbortError") {
        setStatus("ready");
        setProgress(0);
        setUploadError("Upload dibatalkan.");
        toast("Upload dibatalkan.");
        return;
      }

      setStatus("error");
      setProgress(0);
      setUploadError(error.message || "Terjadi kesalahan saat upload.");
      toast.error(error.message || "Upload gagal.");
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
  };

  const handleCopyFileId = async () => {
    if (!result?.fileId) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result.fileId);
      toast.success("File ID berhasil disalin.");
    } catch {
      toast.error("Gagal menyalin File ID.");
    }
  };

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      stopProgressSimulation();
    };
  }, []);

  const previewFinalName = selectedFile
    ? buildRenamedFilename(newFileName, selectedFile.name) || "Nama file belum valid"
    : "-";
  const isSuccess = status === "success" && Boolean(result);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-xl"
    >
      <Card className="bg-card/95 shadow-lg backdrop-blur-sm">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-xl">Upload ke BEM Print</CardTitle>
            <div className="flex items-center gap-1.5">
              {SUPPORTED_BADGES.map((label) => (
                <Badge key={label} variant="outline">
                  {label}
                </Badge>
              ))}
            </div>
          </div>
          <CardDescription>
            {isSuccess
              ? "File berhasil ter-upload. Anda bisa membuka hasilnya atau mengulang upload file lain."
              : "Pilih satu file, isi nama file baru, lalu upload ke BEM Print."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="upload-form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <FilePicker
                  file={selectedFile}
                  accept={ACCEPT_ATTRIBUTE}
                  disabled={status === "uploading"}
                  onFileSelected={handleFileSelected}
                />

                <AnimatePresence>
                  {selectedFile ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <FileMeta file={selectedFile} />

                      <div className="space-y-2">
                        <Label htmlFor="newFileName">Nama file baru</Label>
                        <Input
                          id="newFileName"
                          placeholder="Contoh: laporan-keuangan-2026"
                          value={newFileName}
                          disabled={status === "uploading"}
                          onChange={(event) => setNewFileName(event.target.value)}
                          aria-invalid={hasRenameError ? "true" : "false"}
                        />
                        <p className="text-muted-foreground text-xs">
                          Nama final: <span className="font-medium text-foreground">{previewFinalName}</span>
                        </p>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <AnimatePresence>
                  {(validationErrors.length > 0 || hasRenameError || hasUnchangedNameError || uploadError) && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                    >
                      <Alert variant="destructive">
                        <AlertTriangle className="mt-0.5 size-4" />
                        <AlertTitle>Validasi Upload</AlertTitle>
                        <AlertDescription>
                          {validationErrors.map((message) => (
                            <p key={message}>{message}</p>
                          ))}
                          {hasRenameError ? <p>Nama file baru wajib diisi dan tidak boleh hanya spasi.</p> : null}
                          {hasUnchangedNameError ? (
                            <p>Nama file baru harus berbeda dari nama file asli (default).</p>
                          ) : null}
                          {uploadError ? <p>{uploadError}</p> : null}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <UploadProgress status={status} progress={progress} />

                <Separator />

                <UploadActions
                  canUpload={canUpload}
                  isUploading={status === "uploading"}
                  disableReason={disableReason}
                  onUpload={handleUpload}
                  onReset={handleReset}
                  onCancel={handleCancel}
                />
              </motion.div>
            ) : (
              <motion.div
                key="upload-success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Alert className="rounded-xl border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300">
                  <AlertTitle>
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex size-8 items-center justify-center rounded-full bg-emerald-500/15">
                        <CheckCircle className="size-4 text-emerald-600 dark:text-emerald-300" />
                      </span>
                      <span>Upload berhasil</span>
                    </div>
                  </AlertTitle>
                  <AlertDescription className="mt-1 space-y-3">
                    <p className="text-foreground">
                      File: <span className="font-semibold break-all">{result.fileName}</span>
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {result.fileUrl ? (
                        <Button asChild size="sm">
                          <a href={result.fileUrl} target="_blank" rel="noreferrer">
                            <ExternalLink className="size-4" />
                            Buka file di Drive
                          </a>
                        </Button>
                      ) : null}

                      {!result.fileUrl && result.fileId ? (
                        <Button variant="secondary" size="sm" onClick={handleCopyFileId}>
                          <Copy className="size-4" />
                          Copy fileId
                        </Button>
                      ) : null}

                      <Button variant="outline" size="sm" onClick={handleReset}>
                        <RotateCcw className="size-4" />
                        Upload file lain
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default UploadCard;
