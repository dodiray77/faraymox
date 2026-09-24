"use client";
import { PrimeReactProvider, PrimeReactStyleSheet } from "@primereact/core";
import { useServerInsertedHTML } from "next/navigation";
import * as React from "react";
import { definePreset } from "@primeuix/themes";
import Lara from "@primeuix/themes/lara";

const styledStyleSheet = new PrimeReactStyleSheet();
const MyPreset = definePreset(Lara, {
  semantic: {
    primary: {
      50: "{emerald.50}",
      100: "{emerald.100}",
      200: "{emerald.200}",
      300: "{emerald.300}",
      400: "{emerald.400}",
      500: "{emerald.500}",
      600: "{emerald.600}",
      700: "{emerald.700}",
      800: "{emerald.800}",
      900: "{emerald.900}",
      950: "{emerald.950}",
    },
    surface: {
      50: "{slate.50}",
      100: "{slate.100}",
      200: "{slate.200}",
      300: "{slate.300}",
      400: "{slate.400}",
      500: "{slate.500}",
      600: "{slate.600}",
      700: "{slate.700}",
      800: "{slate.800}",
      900: "{slate.900}",
      950: "{slate.950}",
    },
  },
});

const primereact = {
  theme: {
    preset: MyPreset,
    options: {
      darkModeSelector: ".my-app-dark",
    },
  },
  license:
    "eyJpZCI6IjYxNDJlOGEzLTMxZGUtNDRjNi1iM2JiLTVlNjY1NjEzMzFmOCIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3ODY2OTkxOTIsImV4cCI6MTgxODIzNTE5Mn0.VoS1DB3dEWiPhvRAP5NAZj0-lxzuAQ2lo58Ll_MExwwmJy56OXdWBk0frzyFecVzwcr_FRXIhK8WhMiPuw_CBQ",
};
export default function PrimeSSRProvider({ children }) {
  useServerInsertedHTML(() => {
    const styleElements = styledStyleSheet.getAllElements();

    styledStyleSheet.clear();

    return <>{styleElements}</>;
  });

  return (
    <PrimeReactProvider {...primereact} stylesheet={styledStyleSheet}>
      {children}
    </PrimeReactProvider>
  );
}
