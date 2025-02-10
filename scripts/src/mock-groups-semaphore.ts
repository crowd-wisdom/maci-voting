export {}
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { generateProof } from "@semaphore-protocol/proof"
import { ethers,parseEther,Contract, AbiCoder} from "ethers";
import path from "path"
import {readFile} from 'fs/promises'
import { getDeployedContractsByNetworkWithPath } from "./utilsSemaphore.js";
import { Keypair } from "maci-domainobjs";
import { getDeployedContractAddressMACI } from "./utilsMACI.js";
import 'dotenv/config'

async function main() {

const url = "http://localhost:8545"
const provider = new ethers.JsonRpcProvider()

const abiSemaphore = path.resolve(__dirname, '../semaphore/packages/contracts/artifacts/contracts/Semaphore.sol/Semaphore.json')
const abiMaci= path.resolve(__dirname, '../maci/packages/contracts/artifacts/contracts/MACI.sol/MACI.json')
const abiSemaphoreMultiGroup = path.resolve(__dirname, '../maci/packages/contracts/artifacts/contracts/gatekeepers/SemaphoreGatekeeperMultiGroup.sol/SemaphoreGatekeeperMultiGroup.json')
const deployedSemaphoreContractsPath = path.resolve(__dirname, '../semaphore/packages/utils/src/networks/deployed-contracts.json')
const deployedMaciContractsPath = path.resolve(__dirname, '../maci/packages/contracts/deployed-contracts.json')

const deployedSemaphoreContractsParsed = await getDeployedContractsByNetworkWithPath('localhost',deployedSemaphoreContractsPath)

const maciAddress = await getDeployedContractAddressMACI(deployedMaciContractsPath,'MACI')
const semaphoreGatekeeperMultiGroupAddress = await getDeployedContractAddressMACI(deployedMaciContractsPath,'SemaphoreGatekeeperMultiGroup')
const dataSemaphoreAbi = await parseAndExtractAbi(abiSemaphore)
const dataMaciAbi = await parseAndExtractAbi(abiMaci)
const dataSemaphoreMultiGroupAbi = await parseAndExtractAbi(abiSemaphoreMultiGroup)

const semaphoreAddress = deployedSemaphoreContractsParsed.contracts[2].address

const wallet =  new ethers.Wallet(process.env.BACKEND_PRIVATE_KEY as string,provider)

const semaphoreContract = new Contract(semaphoreAddress, dataSemaphoreAbi, wallet)

console.info("Grupo: ",await semaphoreContract.groupCounter())
const randomString= generateRandomString(5);
const identity = new Identity(randomString)
const members = Array.from({ length: 1 }, (_, i) => new Identity(randomString)).map(({ commitment }) => commitment)
const group = new Group(members)

console.info(`Creating new group...`)

// Create a group and add 3 members.
let tx = await semaphoreContract["createGroup(address)"](wallet.address)

const { logs } = (await tx.wait()) as any
const [groupId] = logs[0].args

console.info(`Adding ${members.length} members to group '${groupId}'...`)

tx = await semaphoreContract.addMembers(groupId, members)

await tx.wait()

const message = groupId
console.info('Generating the proof...')
let proof = await generateProof(identity, group, message, group.root)
console.info('Validating the proof...')
tx = await semaphoreContract.validateProof(groupId, proof)
await tx.wait()

const encodedProof= AbiCoder.defaultAbiCoder().encode(
    ["uint256", "uint256", "uint256", "uint256", "uint256", "uint256[8]"],
    [
      proof.merkleTreeDepth,
      proof.merkleTreeRoot,
      proof.nullifier,
      proof.message,
      proof.scope,
      proof.points,
    ],
  );

const semaphoreGatekeeperMultiGroupContract = new Contract(semaphoreGatekeeperMultiGroupAddress,dataSemaphoreMultiGroupAbi,wallet)
console.info('Set group in Gatekeeper...')
tx = await semaphoreGatekeeperMultiGroupContract.setSemaphoreGroups(groupId)
await tx.wait();
const maciContract = new Contract(maciAddress, dataMaciAbi, wallet)
console.info('Sign Up in MACI with SemaphoreGatekeeperMultiGroup...')
const user = new Keypair();
tx = await maciContract.signUp(
    user.pubKey.asContractParam(),
    encodedProof,
    AbiCoder.defaultAbiCoder().encode(["uint256"], [1]),
  )

await tx.wait();
console.info('Success!')

}


async function parseAndExtractAbi(abiPath:any) {

    const dataFile = await readFile(abiPath, 'utf8')
    const dataParse = JSON.parse(dataFile)
    return dataParse.abi
    
}

function generateRandomString(length:number) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    result += alphabet[randomIndex];
  }
  return result;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })