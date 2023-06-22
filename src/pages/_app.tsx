import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { WagmiConfig, configureChains, createClient } from "wagmi";
// import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";
import { polygonMumbai } from "@wagmi/chains";
import { InjectedConnector } from "wagmi/connectors/injected";
import { Chain } from "wagmi";

export const okbc = {
  id: 195,
  name: "OKBC",
  network: "okbc",
  nativeCurrency: {
    decimals: 18,
    name: "OKB",
    symbol: "OKB",
  },
  rpcUrls: {
    public: { http: ["https://okbtestrpc.okbchain.org "] },
    default: { http: ["https://okbtestrpc.okbchain.org "] },
  },
  blockExplorers: {
    etherscan: { name: "OKLINK", url: "https://www.oklink.com/okbc-test" },
    default: { name: "OKLINK", url: "https://www.oklink.com/okbc-test" },
  },
} as const satisfies Chain;

const connector = new InjectedConnector();

export const { provider } = configureChains([okbc], [publicProvider()]);

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
