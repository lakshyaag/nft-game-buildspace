import React, { useEffect, useState } from "react";
import "./Arena.css";
import { ethers } from "ethers";
import {
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
  transformCharacterData,
} from "../../utils/constants";
import LoadingIndicator from "../LoadingIndicator";

const Arena = ({ characterNFT, setCharacterNFT }) => {
  const [gameContract, setGameContract] = useState(null);
  const [boss, setBoss] = useState(null);

  const [attackState, setAttackState] = useState("");

  const runAttackAction = async () => {
    try {
      if (gameContract) {
        setAttackState("attacking");
        console.log("Attacking boss...");
        const attackTxn = await gameContract.attackBoss();
        await attackTxn.wait();
        setAttackState("hit");
      }
    } catch (e) {
      console.log(e);
      setAttackState("");
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
      console.log("Ethereum object not found");
    }
  }, []);

  useEffect(() => {
    const getBossCharacter = async () => {
      const bossTxn = await gameContract.getBoss();
      setBoss(transformCharacterData(bossTxn));
    };

    const onAttackComplete = (newBossHp, newPlayerHp) => {
      const bossHp = newBossHp.toNumber();
      const playerHp = newPlayerHp.toNumber();

      console.log(
        `Attack complete! Boss HP is ${bossHp}; Player HP is ${playerHp}`
      );

      setBoss((prevState) => ({
        ...prevState,
        hp: bossHp,
      }));

      setCharacterNFT((prevState) => ({
        ...prevState,
        hp: playerHp,
      }));
    };

    if (gameContract) {
      getBossCharacter();
      gameContract.on("attackComplete", onAttackComplete);
    }

    return () => {
      if (gameContract) {
        gameContract.off("attackComplete", onAttackComplete);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameContract]);

  return (
    <div className="arena-container">
      {boss && (
        <div className="boss-container">
          <div className={`boss-content ${attackState}`}>
            <h2>{boss.name}</h2>
            <div className="image-content">
              <img src={boss.imageURI} alt={`Boss ${boss.name}`} />
              <div className="health-bar">
                <progress value={boss.hp} max={boss.maxHp} />
                <p>{`${boss.hp}/${boss.maxHp}`}</p>
              </div>
            </div>
          </div>
          <div className="attack-container">
            <button className="cta-button" onClick={runAttackAction}>
              {`Attack ${boss.name}`}
            </button>
          </div>
          {attackState === "attacking" && (
            <div className="loading-indicator">
              <LoadingIndicator />
              <p>Attacking...</p>
            </div>
          )}
        </div>
      )}

      {characterNFT && (
        <div className="players-container">
          <div className="player-container">
            <h2>{`${characterNFT.name}`}</h2>
            <div className="player">
              <div className="image-content">
                <img
                  src={characterNFT.imageURI}
                  alt={`Character: ${characterNFT.name}`}
                />
                <div className="health-bar">
                  <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                  <p>{`${characterNFT.hp} / ${characterNFT.maxHp}`}</p>
                </div>
              </div>
              <div className="stats">
                <h4>{`Attack Damage: ${characterNFT.attackDmg}`}</h4>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Arena;
