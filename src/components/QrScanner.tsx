import { useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

interface Props {
  id:       string;
  onScan:   (result: string) => void;
  onError?: (err: string) => void;
}

export function QrScanner({ id, onScan, onError }: Props) {
  const ref   = useRef<Html5Qrcode | null>(null);
  const fired = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode(id);
    ref.current   = scanner;
    fired.current = false;

    scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      (decodedText) => {
        if (fired.current) return;
        fired.current = true;
        const state = scanner.getState();
        if (
          state === Html5QrcodeScannerState.SCANNING ||
          state === Html5QrcodeScannerState.PAUSED
        ) {
          scanner.stop().catch(() => {});
        }
        onScan(decodedText);
      },
      () => {}, // suppress per-frame not-found errors
    ).catch((err) => {
      onError?.(String(err));
    });

    return () => {
      fired.current = true;
      const state = ref.current?.getState();
      if (
        state === Html5QrcodeScannerState.SCANNING ||
        state === Html5QrcodeScannerState.PAUSED
      ) {
        ref.current?.stop().catch(() => {});
      }
    };
  }, [id]);

  return (
    <div
      id={id}
      className="w-full rounded-2xl overflow-hidden mb-4"
      style={{ minHeight: 280 }}
    />
  );
}