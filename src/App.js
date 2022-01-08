import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";

import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  transformCharacterData,
} from "./utils/constants";

import SelectCharacter from "./Components/SelectCharacter";
import Arena from "./Components/Arena";
import LoadingIndicator from "./Components/LoadingIndicator";

// Constants
const TWITTER_HANDLE = "lakshyaag";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const checkNetwork = async () => {
    try {
      const chainID = await window.ethereum.request({ method: "eth_chainId" });
      if (chainID !== "0x4") {
        alert("Please connect to the Rinkeby Testnet");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("MetaMask not found!");

        setIsLoading(false);
        return;
      } else {
        console.log("Metamask found:", ethereum);

        const accounts = await ethereum.request({ method: "eth_accounts" });

        if (accounts.length !== 0) {
          const account = accounts[0];

          setCurrentAccount(account);

          console.log("Found authorized account", account);
        } else {
          console.log("No authorized account found!");
        }
      }
    } catch (e) {
      console.log(e);
    }

    setIsLoading(false);
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Please install MetaMask");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);

      console.log("Connected with:", accounts[0]);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchNFTMetadata = async () => {
    console.log("Checking for character NFT on address:", currentAccount);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const gameContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );

    const txn = await gameContract.checkIfUserHasNFT();
    if (txn.name) {
      console.log("User has character NFT");
      setCharacterNFT(transformCharacterData(txn));
    } else {
      console.log("No character NFT found");
    }

    setIsLoading(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator />;
    }

    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            src="https://media3.giphy.com/media/xTiIzzPYeXlvYdx4ic/giphy.gif"
            alt="Star Wars Gif"
          />
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWallet}
          >
            Connect wallet!
          </button>
        </div>
      );
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
    } else if (currentAccount && characterNFT) {
      return (
        <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />
      );
    }
  };

  useEffect(() => {
    checkNetwork();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    if (currentAccount) {
      fetchNFTMetadata();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <div className="header">
            <p className="emoji">⚔️</p>
            <p className="gradient-text"> Star Fight Slayer </p>
            <p className="emoji">⚔️</p>
          </div>
          {currentAccount && (
            <p className="connected-address">
              Connected with: {currentAccount}
            </p>
          )}
          <p className="sub-text">Team up to protect the Starworld!</p>
        </div>
        {renderContent()}
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
