import type { AppProps } from "next/app";
import "../styles/globals.css";

export default function SoulScopeApp({
  Component,
  pageProps,
}: AppProps) {
  return <Component {...pageProps} />;
}
