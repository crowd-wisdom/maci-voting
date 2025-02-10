export {}
import { ethers,parseEther } from "ethers";
import 'dotenv/config'

async function main() {

console.info(process.env.BACKEND_PRIVATE_KEY)
const url = "http://localhost:8545"
const provider = new ethers.JsonRpcProvider(url)
const wallet =  new ethers.Wallet(process.env.HARDHAT_SIGNER_PK as string,provider)

console.info("Send funds... ")

const recipient = new ethers.Wallet(process.env.BACKEND_PRIVATE_KEY as string)

const tx = await wallet.sendTransaction({
    to: recipient.address,
    value: parseEther("10.0")
  });
  

await tx.wait();
console.info("Funds sends!")

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })