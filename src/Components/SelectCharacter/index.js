import React, { useEffect, useState } from "react";
import "./SelectCharacter.css";
import { ethers } from "ethers";
import {
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
  transformCharacterData,
} from "../../utils/constants";

import LoadingIndicator from "../LoadingIndicator";

const SelectCharacter = ({ setCharacterNFT }) => {
  const [characters, setCharacters] = useState([]);
  const [gameContract, setGameContract] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const mintCharacterNFTAction = (characterIndex) => async () => {
    try {
      if (gameContract) {
        setIsLoading(true);

        console.log("Minting character...");
        const mintTxn = await gameContract.mintCharNFT(characterIndex);
        await mintTxn.wait();

        setIsLoading(false);
      }
    } catch (e) {
      console.log(e);

      setIsLoading(false);
    }
  };

  useEffect(() => {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      setGameContract(gameContract);
    } else {
      console.log("Ethereum object not found!");
    }
  }, []);

  useEffect(() => {
    const getCharacters = async () => {
      try {
        const charTxn = await gameContract.getDefaultCharacters();
        const characters = charTxn.map((char) => transformCharacterData(char));

        setCharacters(characters);
      } catch (e) {
        console.log(e);
      }
    };

    const onCharacterMint = async (sender, tokenId, characterIndex) => {
      console.log(
        `Character NFT minted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
      );

      console.log(
        `View your newly minted NFT on OpenSea at: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
      );

      if (gameContract) {
        const characterNFT = await gameContract.checkIfUserHasNFT();
        console.log(characterNFT);
        setCharacterNFT(transformCharacterData(characterNFT));
      }
    };

    if (gameContract) {
      getCharacters();
      gameContract.on("charNFTMinted", onCharacterMint);
    }
    return () => {
      if (gameContract) {
        gameContract.off("charNFTMinted", onCharacterMint);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameContract]);

  const renderCharacters = () => {
    return characters.map((character, index) => (
      <div className="character-item" key={character.name}>
        <div className="name-container">{character.name}</div>
        <img src={character.imageURI} alt={character.name} />
        <button
          type="button"
          className="character-mint-button"
          onClick={mintCharacterNFTAction(index)}
        >
          {`Mint ${character.name}`}
        </button>
      </div>
    ));
  };

  return (
    <div className="select-character-container">
      <h2>Mint your character!</h2>
      {characters.length > 0 && (
        <div className="character-grid">{renderCharacters()}</div>
      )}
      {isLoading && (
        <div className="loading">
          <LoadingIndicator />
          <p>Minting in progress...</p>
        </div>
      )}
    </div>
  );
};

export default SelectCharacter;
