
import {readFile} from 'fs/promises'
import path from "path"

const deployedContractsPath = path.resolve(__dirname, '../semaphore/packages/utils/src/networks/deployed-contracts.json')


export type NetworkDeployedContracts = {
    name: "Semaphore" | "SemaphoreVerifier" | "PoseidonT3"
    address: string
    startBlock: number
}[]

export type DeployedContracts = {
    network: string
    contracts: NetworkDeployedContracts
}[]


export async function getDeployedContracts(): Promise<DeployedContracts> {
    const dataFile = await readFile(deployedContractsPath, 'utf8')
    return JSON.parse(dataFile)
}


export async function getDeployedContractsByNetwork(network: string): Promise<NetworkDeployedContracts> {
    const deployedContracts = await getDeployedContracts()
    const networkDeployedContracts = deployedContracts.find((n) => n.network === network)

    if (!networkDeployedContracts) {
        throw Error(`Network '${network}' is not supported`)
    }

    return networkDeployedContracts.contracts
}

export async function getDeployedContractAddress(network: string, contractName: string): Promise<string> {
    const contracts = await getDeployedContractsByNetwork(network)
    const semaphoreAddress = contracts.find((contract) => contract.name === contractName)

    if (!semaphoreAddress) {
        throw Error(`Contract with name '${contractName}' does not exist`)
    }

    return semaphoreAddress.address
}

export async function getDeployedContractsByNetworkWithPath(network: string, pathContracts: any) {
    const dataFile = await readFile(pathContracts, 'utf8')

    const deployedontractsParsed = JSON.parse(dataFile)

    const networkDeployedContracts = deployedontractsParsed.find((n:any) => n.network === network)

    if (!networkDeployedContracts) {
        throw Error(`Network '${network}' is not supported`)
    }

    return networkDeployedContracts
}
