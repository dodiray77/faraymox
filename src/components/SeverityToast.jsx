"use client";
import { Toaster } from "@primereact/ui/toaster";
import { Toast } from "@primereact/ui/toast";
import { Check, Times } from "@primeicons/react";

export default function SeverityToast() {
  return (
    <Toaster.Root group="severity">
      <Toaster.Portal>
        <Toaster.Region>
          {({ toaster }) =>
            toaster?.toasts.map((toast) => (
              <Toast.Root key={toast.id} toast={toast}>
                <Toast.Content>
                  <Toast.Icon match="success">
                    <Check />
                  </Toast.Icon>
                  <Toast.Icon match="error">
                    <Times />
                  </Toast.Icon>
                  <Toast.Message>
                    <Toast.Title />
                    <Toast.Description />
                  </Toast.Message>
                  <Toast.Close>
                    <Times />
                  </Toast.Close>
                </Toast.Content>
              </Toast.Root>
            ))
          }
        </Toaster.Region>
      </Toaster.Portal>
    </Toaster.Root>
  );
}
