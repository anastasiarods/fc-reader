import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { BASE_NFT_COLLECTION_ADDRESS, CHAIN } from "../constants";

const sdk = ThirdwebSDK.fromPrivateKey(process.env.PRIVATE_KEY || "", CHAIN, {
  secretKey: process.env.THIRDWEB_SECRET_KEY,
});

export const claimNFT = async (
  toAddress: string,
  originalLink: string,
  image: string
) => {
  const contract = await sdk.getContract(BASE_NFT_COLLECTION_ADDRESS);

  const tx = await contract.erc721.mintTo(toAddress, {
    image: image,
    name: `test`,
    external_url: originalLink,
  });

  console.log(tx);
};

export const alreadyClaimed = async (address: string) => {
  const contract = await sdk.getContract(
    BASE_NFT_COLLECTION_ADDRESS,
    "nft-collection"
  );
  const balance = await contract.balanceOf(address);
  return balance.toNumber() > 0;
};
