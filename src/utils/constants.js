import myGame from "./myGame.json";

const CONTRACT_ADDRESS = "0xB9b59922772b7f4A5918AEFcaFAa1C6be5A53DEc";
const CONTRACT_ABI = myGame.abi;

const transformCharacterData = (charData) => {
  return {
    name: charData.name,
    imageURI: "https://cloudflare-ipfs.com/ipfs/" + charData.imageURI,
    hp: charData.hp.toNumber(),
    maxHp: charData.maxHp.toNumber(),
    force: charData.force.toNumber(),
    maxForce: charData.maxForce.toNumber(),
    attackDmg: charData.attackDmg.toNumber(),
  };
};

export { CONTRACT_ADDRESS, CONTRACT_ABI, transformCharacterData };
