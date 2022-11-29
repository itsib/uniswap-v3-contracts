import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import hre from 'hardhat';

async function main() {
  const network = hre.hardhatArguments.network;
  if (!network) {
    console.log(chalk.red.bold('ERROR:'), chalk.red(`Network name not defined.`));
    console.log(chalk.red.italic('Please use the --network flag'));
    return;
  }

  const deployInfoPath = path.resolve(hre.config.paths.root, 'deploy-info', `${network}.json`);
  if (!fs.existsSync(deployInfoPath)) {
    console.log(chalk.red.bold('ERROR:'), chalk.red(`Contract not deployed to the "${network}" network.`));
    console.log(chalk.red.italic('Please deploy contract with command "npm run deploy:{NETWORK_NAME}"'));
    return;
  }

  const deployInfo = JSON.parse(fs.readFileSync(deployInfoPath, { encoding: 'utf-8' })) as { address: string; args: any[] }[];

  for (const { address, args } of deployInfo) {
    try {
      console.log(`Verify contract:`, chalk.green(address));
      await hre.run('verify:verify', { address, constructorArguments: args });
      console.log(chalk.green('Contract verified.\n'));
    } catch (e) {
      console.log(chalk.red.bold('ERROR:'), chalk.red(`Contract verification error "${address}".`));
      console.error(e);
      console.log('\n');
    }
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
