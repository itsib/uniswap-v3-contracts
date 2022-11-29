import chalk from 'chalk';
import { Spinner } from 'cli-spinner';
import fs from 'fs';
import hre from 'hardhat';
import path from 'path';
import { DEPLOY_CONFIG, DeployConfig } from '../config/deploy-config';

async function main() {
  const network = hre.hardhatArguments.network;
  if (!network) {
    console.log(chalk.red.bold('ERROR:'), chalk.red(`Network name not defined.`));
    console.log(chalk.red.italic('Please use the --network flag'));
    return;
  }
  if (!DEPLOY_CONFIG[network]) {
    console.log(chalk.red.bold('ERROR:'), chalk.red(`Network "${network}" not configured.`));
    console.log(chalk.red.italic('Please use file "./config/deploy-config.ts" for configuration deploy params'));
    return;
  }
  const deployConfig: DeployConfig = DEPLOY_CONFIG[network];

  // Deploy Exchange contract
  const exchangeSpinner = new Spinner(`Deploying ${deployConfig.exchangeContractName} contract... %s`);
  exchangeSpinner.start();
  let exchange;
  try {
    const Exchange = await hre.ethers.getContractFactory(deployConfig.exchangeContractName);
    exchange = await Exchange.deploy(deployConfig.exchangeRouter);
    await exchange.deployed();

    exchangeSpinner.stop(true);
    console.log(`${deployConfig.exchangeContractName} deployed to:`, chalk.green(exchange.address));
  } catch (e) {
    exchangeSpinner.stop(true);
    throw e;
  }

  // Deploy The Gas Station Contract
  const gasStationSpinner = new Spinner('Deploying Gas Station contract... %s');
  gasStationSpinner.start();
  let gasStation;
  try {
    const GasStation = await hre.ethers.getContractFactory('GasStation');
    gasStation = await GasStation.deploy(exchange.address, deployConfig.approver, deployConfig.feePayer, deployConfig.txRelayFee, deployConfig.feeTokens);
    await gasStation.deployed();

    gasStationSpinner.stop(true);
    console.log(`Gas Station deployed to:`, chalk.green(gasStation.address));
  } catch (e) {
    gasStationSpinner.stop(true);
    throw e;
  }

  // To save deploy info
  const deployInfo = [
    {
      address: exchange.address,
      args: [deployConfig.exchangeRouter],
    },
    {
      address: gasStation.address,
      args: [exchange.address, deployConfig.approver, deployConfig.feePayer, deployConfig.txRelayFee, deployConfig.feeTokens],
    },
  ];
  const deployInfoDir = path.resolve(hre.config.paths.root, 'deploy-info');
  if (!fs.existsSync(deployInfoDir)) {
    fs.mkdirSync(deployInfoDir);
  }
  fs.writeFileSync(path.resolve(deployInfoDir, `${network}.json`), JSON.stringify(deployInfo, null, '  '));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
