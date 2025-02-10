import {readFile} from 'fs/promises'


export async function getDeployedContractAddressMACI(path:string, id:string) {
    const dataFile = await readFile(path, 'utf8')
    const dataParse = JSON.parse(dataFile)

    return dataParse.localhost.named[`${id}`].address
}