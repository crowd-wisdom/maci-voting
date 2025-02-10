export {}
import { copyFile} from "fs"
import path from "path"

const deployedContractsPath = path.join(process.cwd(),'/semaphore/packages/utils/src/networks/deployed-contracts.json')

async function main() {

    await copyDeployedContracts()

}

export async function copyDeployedContracts() {
    const source = deployedContractsPath;
    const destination = path.join(__dirname, 'deployed-semaphore-contracts.json');
    copyFile(source, destination, (err: NodeJS.ErrnoException | null) => {
        if (err) {
          console.error('Error al copiar el archivo:', err);
        } else {
          console.log('Archivo copiado con éxito.');
        }
      });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })