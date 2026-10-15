"use client";

import {
  RiCheckboxCircleFill,
  RiDownloadLine,
  RiFileCopyLine,
  RiInformationFill,
} from "@repo/ui/icon";
import { useState } from "react";

import * as Alert from "@repo/ui/alert";
import * as Button from "@repo/ui/button";
import * as Input from "@repo/ui/input";
import * as Label from "@repo/ui/label";
import * as Modal from "@repo/ui/modal";

interface BackupStepProps {
  backupCodes: string[];
  onComplete: () => void;
}

export function BackupStep({ backupCodes, onComplete }: BackupStepProps) {
  const [isAllCopied, setIsAllCopied] = useState(false);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setIsAllCopied(true);
    setTimeout(() => setIsAllCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([backupCodes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Modal.Body className="space-y-4">
        <div className="w-full">
          <div className="mb-2 flex items-center justify-between">
            <Label.Root htmlFor="backup-codes">
              Backup Codes
              <Label.Sub>(save these)</Label.Sub>
            </Label.Root>
            <div className="flex items-center gap-2">
              <Button.Root
                aria-label="Copy All Codes"
                mode="lighter"
                onClick={handleCopyAll}
                size="xsmall"
                type="button"
                variant="neutral"
              >
                {isAllCopied ? (
                  <Button.Icon
                    as={RiCheckboxCircleFill}
                    className="text-success-dark"
                  />
                ) : (
                  <Button.Icon as={RiFileCopyLine} />
                )}
              </Button.Root>
              <Button.Root
                aria-label="Download Codes"
                mode="lighter"
                onClick={handleDownload}
                size="xsmall"
                type="button"
                variant="neutral"
              >
                <Button.Icon as={RiDownloadLine} />
              </Button.Root>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2">
            {backupCodes.map((code) => (
              <Input.Root key={code} size="small">
                <Input.Wrapper>
                  <Input.Input
                    className="select-all text-center font-mono"
                    disabled
                    readOnly
                    value={code}
                  />
                </Input.Wrapper>
              </Input.Root>
            ))}
          </div>
          <Alert.Root size="xsmall" status="information" variant="lighter">
            <Alert.Icon as={RiInformationFill} />
            Store these backup codes in a secure location. Each code can be used
            once if you lose access to your authenticator app.
          </Alert.Root>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button.Root
          className="w-full"
          onClick={onComplete}
          size="small"
          variant="primary"
        >
          Finish Setup
        </Button.Root>
      </Modal.Footer>
    </>
  );
}
