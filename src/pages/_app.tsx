import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { WagmiConfig, configureChains, createClient } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { polygonMumbai } from "@wagmi/chains";
import { InjectedConnector } from 'wagmi/connectors/injected'

const connector = new InjectedConnector();

export const { provider } = configureChains(
  [polygonMumbai],
  [
    jsonRpcProvider({
      rpc: () => ({
        http: `https://matic-mumbai.chainstacklabs.com`,
      }),
    }),
  ]
);

const client = createClient({
  autoConnect: true,
  provider: provider,
  connectors: [connector],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={client}>
      <Component {...pageProps} />
    </WagmiConfig>
  );
}
