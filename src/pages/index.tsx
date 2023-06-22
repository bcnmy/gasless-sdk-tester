import { Inter } from "@next/font/google";
import { useEffect, useState } from "react";
import { Biconomy } from "@biconomy/mexaLocal";
let abi = require("ethereumjs-abi");
import { toBuffer } from "ethereumjs-util";
import {
  useAccount,
  useConnect,
  useContract,
  useDisconnect,
  useProvider,
  useSigner,
} from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import {
  ABI,
  API_KEY,
  CUSTOM_QUOTE_CONTRACT,
  EIP712_QUOTE_CONTRACT,
} from "../const";
import { ContractInterface, ethers } from "ethers";

const inter = Inter({ subsets: ["latin"] });

let biconomy: Biconomy;

type Quote = {
  quote: string;
  address: string;
};

export type ExternalProvider = {
  isMetaMask?: boolean;
  isStatus?: boolean;
  host?: string;
  path?: string;
  sendAsync?: (
    request: { method: string; params?: Array<any> },
    callback: (error: any, response: any) => void
  ) => void;
  send?: (
    request: { method: string; params?: Array<any> },
    callback: (error: any, response: any) => void
  ) => void;
  request?: (request: { method: string; params?: Array<any> }) => Promise<any>;
};

export default function Home() {
  const [eip2771, setEip2771] = useState(true);
  const [biconomyObject, setBiconomyObject] = useState<Biconomy | null>(null);
  const [bicoContract, setBicoContract] = useState<any>(null);
  const [walletText, setWalletText] = useState("Connect Wallet");
  const [currentQuoteObject, setCurrentQuoteObject] = useState<Quote | any>(
    null
  );
  const [inputQuote, setInputQuote] = useState<any>(null);
  const [eip712Sign, setEip712Sign] = useState(true);
  const [isBiconomyInit, setIsBiconomyInit] = useState<boolean | undefined>(
    undefined
  );
  const useContractAddress = eip2771
    ? EIP712_QUOTE_CONTRACT
    : CUSTOM_QUOTE_CONTRACT;
  // const useContractAddress = eip2771
  //   ? LEGACY_712_CONTRACT
  //   : LEGACY_CUSTOM_CONTRACT;
  const { address, isConnected } = useAccount();
  const { data: signer } = useSigner();
  const provider = signer?.provider as any;

  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();

  const domainType = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "verifyingContract", type: "address" },
    { name: "salt", type: "bytes32" },
  ];

  const metaTransactionType = [
    { name: "nonce", type: "uint256" },
    { name: "from", type: "address" },
    { name: "functionSignature", type: "bytes" },
  ];

  let domainData = {
    name: "TestContract",
    version: "1",
    verifyingContract: useContractAddress,
    salt: ethers.utils.hexZeroPad((ethers.BigNumber.from(80001)).toHexString(), 32),
  };

  useEffect(() => {
    const initBiconomy = async () => {
      setIsBiconomyInit(true);
      console.log(provider)
      biconomy = new Biconomy(provider, {
        apiKey: API_KEY,
        debug: true,
        strictMode: true,
      });
      biconomy
        .onEvent(biconomy.READY, async () => {
          // Initialize your dapp here like getting user accounts etc
          let contract = new ethers.Contract(
            useContractAddress,
            ABI,
            biconomy?.getSignerByAddress(address)
          );
          setBicoContract(contract);
          getQuoteFromNetwork(contract);
        })
        .onEvent(biconomy.ERROR, (error: any, message: any) => {
          // Handle error while initializing mexa
          console.log(message);
          console.log(error);
        });
      setIsBiconomyInit(false);
    };
    if (!isConnected) {
      connect();
    }
    if (provider) {
      initBiconomy();
    }
  }, [isConnected, provider, useContractAddress]);

  const getQuoteFromNetwork = async (contract: ethers.Contract) => {
    let result = await contract.getQuote();
    console.log(
      "🚀 ~ file: index.tsx:113 ~ getQuoteFromNetwork ~ result:",
      result
    );
    setCurrentQuoteObject({
      quote: result.currentQuote,
      address: result.currentOwner,
    });
  };

  const setQuote = async () => {
    if (eip2771) {
      try {
        let { data } = await bicoContract.populateTransaction.setQuote(
          inputQuote
        );
        let provider = biconomy.getEthersProvider();

        let txParams = {
          data: data,
          to: useContractAddress,
          from: address,
          signatureType: eip712Sign ? "EIP712_SIGN" : "PERSONAL_SIGN",
        };
        let tx: any;
        try {
          tx = await provider.send("eth_sendTransaction", [txParams]);
        } catch (err) {
          console.log("handle errors like signature denied here");
          console.log(err);
        }

        console.log("Transaction hash : ", tx);

        //event emitter methods
        provider.once(tx, (transaction: any) => {
          // Emitted when the transaction has been mined
          console.log(transaction);
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      if (eip712Sign) {
        let nonce = await bicoContract.getNonce(address);
        let contractInterface = new ethers.utils.Interface(ABI);
        let functionSignature = contractInterface.encodeFunctionData(
          "setQuote",
          [inputQuote]
        );
        let message = {
          nonce: parseInt(nonce),
          from: address,
          functionSignature: functionSignature,
        };

        const dataToSign = JSON.stringify({
          types: {
            EIP712Domain: domainType,
            MetaTransaction: metaTransactionType,
          },
          domain: domainData,
          primaryType: "MetaTransaction",
          message: message,
        });

        // Its important to use eth_signTypedData_v3 and not v4 to get EIP712 signature because we have used salt in domain data
        // instead of chainId
        let signature = await provider.send("eth_signTypedData_v3", [
          address,
          dataToSign,
        ]);
        let { r, s, v } = getSignatureParameters(signature);
        sendSignedTransaction(useContractAddress, functionSignature, r, s, v);
      }else{
                let nonce = await bicoContract.getNonce(address);
                let contractInterface = new ethers.utils.Interface(ABI);
                let functionSignature = contractInterface.encodeFunctionData("setQuote", [inputQuote]);
                let messageToSign = constructMetaTransactionMessage(nonce.toNumber(), 42, functionSignature, useContractAddress);
                const signature = await signer?.signMessage(messageToSign);
                
                console.info(`User signature is ${signature}`);
                let { r, s, v } = getSignatureParameters(signature);
                sendSignedTransaction(address, functionSignature, r, s, v);
      }
    }
  };

  const constructMetaTransactionMessage = (nonce, salt, functionSignature, contractAddress) => {
    return abi.soliditySHA3(
        ["uint256","address","uint256","bytes"],
        [nonce, contractAddress, salt, toBuffer(functionSignature)]
    );
  }

  const getSignatureParameters = (signature: string) => {
    if (!ethers.utils.isHexString(signature)) {
      throw new Error(
        'Given value "'.concat(signature, '" is not a valid hex string.')
      );
    }
    var r = signature.slice(0, 66);
    var s = "0x".concat(signature.slice(66, 130));
    var v: any = "0x".concat(signature.slice(130, 132));
    v = ethers.BigNumber.from(v).toNumber();
    if (![27, 28].includes(v)) v += 27;
    return {
      r: r,
      s: s,
      v: v,
    };
  };

  const sendSignedTransaction = async (
    userAddress: any,
    functionData: string,
    r: any,
    s: string,
    v: any
  ) => {
    try {
      console.log(
        "🚀 ~ file: index.tsx:246 ~ sendSignedTransaction ~ userAddress",
        functionData,
        r,
        s,
        v
      );
      let tx = await bicoContract.executeMetaTransaction(
        userAddress,
        functionData,
        r,
        s,
        v,
        {
          gasLimit: 10000000,
        }
      );
      await tx.wait(1);
      console.log("Transaction hash : ", tx.hash);
      console.log(tx);

      getQuoteFromNetwork(bicoContract);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-50 flex flex-col items-start justify-start gap-8 p-8">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-4xl">Gasless SDK Demo</h1>
        <button
          className="w-80 h-10 bg-gray-900 rounded text-white"
          onClick={() => (isConnected ? disconnect() : connect())}
        >
          {walletText}
        </button>
      </div>
      {isBiconomyInit !== undefined && (
        <h2
          className={
            isBiconomyInit === true
              ? "text-xl text-yellow-500"
              : "text-xl text-green-500"
          }
        >
          {isBiconomyInit === true
            ? "Biconomy is initiating..."
            : "Biconomy is Initiated!"}
        </h2>
      )}
      <div className="flex gap-8 w-full items-center justify-start">
        <span>
          <label htmlFor="EIP2771">Use EIP2771: </label>
          <input
            type="checkbox"
            onChange={(e) => {
              setEip2771(e.target.checked);
            }}
            checked={eip2771}
            name="EIP2771"
            id="EIP2771"
          />
        </span>
        <span>
          <label htmlFor="EIP712">Use EIP712 Sign: </label>
          <input
            type="checkbox"
            onChange={(e) => {
              setEip712Sign(e.target.checked);
            }}
            name="EIP712"
            checked={eip712Sign}
            id="EIP712"
          />
        </span>
      </div>
      <span className="text-xl">
        Current Quote:{" "}
        {currentQuoteObject ? (
          <h1 className="text-3xl font-bold text-green-500">
            {currentQuoteObject.quote}
          </h1>
        ) : (
          "Loading..."
        )}
      </span>
      <span>
        Quote Set By :{" "}
        {currentQuoteObject ? (
          <h1 className="text-green-500">{currentQuoteObject.address}</h1>
        ) : (
          "Loading..."
        )}
      </span>
      <h2>
        Current Configuration: <br />{" "}
        {eip712Sign ? "EIP-712 Sign" : "Custom Sign"} +{" "}
        {eip2771 ? "EIP-2771 MetaTx" : "Custom MetaTx"}
      </h2>
      <div className="my-4 flex flex-col">
        <label htmlFor="input">Set your Quote:</label>
        <input
          onChange={(e) => setInputQuote(e.target.value)}
          className="border w-80 h-10 p-2"
          type="text"
        />
        <button
          className="w-40 my-4 h-10 bg-gray-900 rounded text-white"
          onClick={() => setQuote()}
        >
          Set Quote!
        </button>
      </div>
    </div>
  );
}
