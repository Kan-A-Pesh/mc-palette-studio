// AlignUI Toast wrapper v0.0.0
"use client";

import { RiLoader2Line } from "@remixicon/react";
import * as React from "react";
import type { ExternalToast } from "sonner";
import { toast as sonnerToast } from "sonner";

import { Toaster as ConfiguredToaster } from "@/ui/sonner";
import { Root as AlertToast } from "@/ui/toast-alert";

const LoadingSpinner = () => (
  <RiLoader2Line className="animate-spin text-warning-base" size={20} />
);

const defaultOptions: Partial<ExternalToast> = {
  className: "group/toast",
};

const custom: typeof sonnerToast.custom = (render, options) =>
  sonnerToast.custom(render, { ...defaultOptions, ...options });

const information: typeof sonnerToast.info = (message, opts) =>
  sonnerToast.info(message, { ...defaultOptions, ...opts });

const info: typeof sonnerToast.info = (message, opts) =>
  sonnerToast.info(message, { ...defaultOptions, ...opts });

const success: typeof sonnerToast.success = (message, opts) =>
  sonnerToast.success(message, { ...defaultOptions, ...opts });

const error: typeof sonnerToast.error = (message, opts) =>
  sonnerToast.error(message, { ...defaultOptions, ...opts });

const warning: typeof sonnerToast.warning = (message, opts) =>
  sonnerToast.warning(message, { ...defaultOptions, ...opts });

const message: typeof sonnerToast.message = (msg, opts) =>
  sonnerToast.message(msg, { ...defaultOptions, ...opts });

const loading: typeof sonnerToast.loading = (msg, opts) =>
  sonnerToast.loading(msg, { ...defaultOptions, ...opts });

const dismiss = sonnerToast.dismiss;

type PromiseReturn<T> =
  | (string & { unwrap: () => Promise<T> })
  | (number & { unwrap: () => Promise<T> })
  | { unwrap: () => Promise<T> };

const promise: typeof sonnerToast.promise = <ToastData,>(
  promiseT: Parameters<typeof sonnerToast.promise<ToastData>>[0],
  data?: Parameters<typeof sonnerToast.promise<ToastData>>[1],
) => {
  const actualPromise: Promise<ToastData> =
    typeof promiseT === "function"
      ? (promiseT as () => Promise<ToastData>)()
      : (promiseT as Promise<ToastData>);

  const toastId: string | number =
    (data && "id" in data && data.id != null ? data.id : undefined) ??
    Math.random().toString(36).slice(2);

  sonnerToast.custom(
    (t) => (
      <AlertToast
        dismissable={false}
        icon={LoadingSpinner}
        message={normalizeMessage(data?.loading ?? "Loading...")}
        status="information"
        t={t}
        variant="stroke"
      />
    ),
    {
      ...defaultOptions,
      duration: Number.POSITIVE_INFINITY,
      id: toastId,
    },
  );

  const wrappedId = Object.assign(toastId, {
    unwrap: () => actualPromise,
  });

  actualPromise
    .then((result) => {
      const successMessage =
        typeof data?.success === "function"
          ? data.success(result)
          : (data?.success ?? "Success!");

      sonnerToast.custom(
        (t) => (
          <AlertToast
            message={
              typeof successMessage === "string" ||
              React.isValidElement(successMessage)
                ? successMessage
                : String(successMessage)
            }
            status="success"
            t={t}
            variant="lighter"
          />
        ),
        {
          ...defaultOptions,
          id: toastId,
          duration: 4000,
        },
      );
    })
    .catch((error) => {
      const errorMessage =
        typeof data?.error === "function"
          ? data.error(error)
          : (data?.error ?? "Something went wrong");

      sonnerToast.custom(
        (t) => (
          <AlertToast
            message={
              typeof errorMessage === "string" ||
              React.isValidElement(errorMessage)
                ? errorMessage
                : String(errorMessage)
            }
            status="error"
            t={t}
            variant="lighter"
          />
        ),
        {
          ...defaultOptions,
          id: toastId,
          duration: 4000,
        },
      );
    });

  return wrappedId as PromiseReturn<ToastData>;
};

const baseToast = {
  ...sonnerToast,
  custom,
  information,
  info,
  success,
  error,
  warning,
  message,
  loading,
  promise,
  dismiss,
};

const Toaster = ConfiguredToaster;
type ToastOverrides = {
  success: (
    message: Parameters<typeof sonnerToast.success>[0],
    opts?: Parameters<typeof sonnerToast.success>[1],
  ) => string | number;
  error: (
    message: Parameters<typeof sonnerToast.error>[0],
    opts?: Parameters<typeof sonnerToast.error>[1],
  ) => string | number;
  warning: (
    message: Parameters<typeof sonnerToast.warning>[0],
    opts?: Parameters<typeof sonnerToast.warning>[1],
  ) => string | number;
  info: (
    message: Parameters<typeof sonnerToast.info>[0],
    opts?: Parameters<typeof sonnerToast.info>[1],
  ) => string | number;
  information: (
    message: Parameters<typeof sonnerToast.info>[0],
    opts?: Parameters<typeof sonnerToast.info>[1],
  ) => string | number;
  promise: typeof promise;
};

type ToastType = Omit<typeof sonnerToast, keyof ToastOverrides> &
  ToastOverrides;

type SonnerMessage = Parameters<typeof sonnerToast.success>[0];
const normalizeMessage = (m: SonnerMessage): React.ReactNode =>
  typeof m === "function" ? (m as () => React.ReactNode)() : m;

const toast = baseToast as ToastType;

toast.success = (message, opts) =>
  sonnerToast.custom(
    (t) => (
      <AlertToast
        message={normalizeMessage(message)}
        status="success"
        t={t}
        variant="lighter"
      />
    ),
    { ...defaultOptions, ...opts },
  );

toast.error = (message, opts) =>
  sonnerToast.custom(
    (t) => (
      <AlertToast
        message={normalizeMessage(message)}
        status="error"
        t={t}
        variant="lighter"
      />
    ),
    { ...defaultOptions, ...opts },
  );

toast.warning = (message, opts) =>
  sonnerToast.custom(
    (t) => (
      <AlertToast
        message={normalizeMessage(message)}
        status="warning"
        t={t}
        variant="lighter"
      />
    ),
    { ...defaultOptions, ...opts },
  );

toast.info = (message, opts) =>
  sonnerToast.custom(
    (t) => (
      <AlertToast
        message={normalizeMessage(message)}
        status="information"
        t={t}
        variant="lighter"
      />
    ),
    { ...defaultOptions, ...opts },
  );

toast.information = (message, opts) => toast.info(message, opts);

export { toast, Toaster };
