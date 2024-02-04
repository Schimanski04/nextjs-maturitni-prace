"use client";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/spotlight/styles.css";
import "@mantine/code-highlight/styles.css";
import "./globals.css";

import React, { useEffect, useRef } from "react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { ColorSchemeScript, Container, MantineProvider } from "@mantine/core";

import { theme } from "../../theme";
import { NextIntlClientProvider, useMessages, useTimeZone, useLocale } from "next-intl";

import csTranslations from "@/messages/cs.json";
import enTranslations from "@/messages/en.json";
import deTranslations from "@/messages/de.json";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const refNavbar: React.RefObject<HTMLElement> = useRef(null);
  const refFooter: React.RefObject<HTMLElement> = useRef(null);
  const refMain: React.RefObject<HTMLElement> = useRef(null);

  const locale = useLocale() as "cs" | "en" | "de";
  // const messages = useMessages();
  // const timeZone = useTimeZone();

  const messages = {
    "cs": csTranslations,
    "en": enTranslations,
    "de": deTranslations,
  };

  useEffect(() => {
    const handleResize = () => {
      const windowHeight = window.innerHeight;
      const navbarHeight = refNavbar.current ? refNavbar.current.offsetHeight : 0;
      const footerHeight = refFooter.current ? refFooter.current.offsetHeight : 0;

      const mainHeight = windowHeight - navbarHeight - footerHeight;

      if (refMain.current) {
        refMain.current.style.minHeight = `${mainHeight}px`;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <html lang={locale}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
        <link rel="shortcut icon" href="/pslib-logo-icon.svg" type="image/x-icon" />
        <meta name="description" content="Next.js app" />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages[locale]} timeZone="Europe/Prague">
          <MantineProvider theme={theme} defaultColorScheme="auto">
            <Navbar refNavbar={refNavbar} />
            <main ref={refMain}>
              <Container>
                {children}
                <ScrollToTopButton />
              </Container>
            </main>
            <Footer refFooter={refFooter} />
          </MantineProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}