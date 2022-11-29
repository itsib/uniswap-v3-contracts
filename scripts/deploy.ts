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

  // Deploy Uniswap Factory contract
  const factorySpinner = new Spinner(`Deploying UniswapV3Factory contract... %s`);
  factorySpinner.start();
  let factory;
  try {
    const Factory = await hre.ethers.getContractFactory('UniswapV3Factory');
    factory = await Factory.deploy();
    await factory.deployed();

    factorySpinner.stop(true);
    console.log(`UniswapV3Factory deployed to:`, chalk.green(factory.address));
  } catch (e) {
    factorySpinner.stop(true);
    throw e;
  }

  // Deploy Uniswap router Contract
  const swapRouterSpinner = new Spinner('Deploying Swap Router contract... %s');
  swapRouterSpinner.start();
  let swapRouter;
  try {
    const SwapRouter = await hre.ethers.getContractFactory('SwapRouter');
    swapRouter = await SwapRouter.deploy(factory.address, deployConfig.weth);
    await swapRouter.deployed();

    swapRouterSpinner.stop(true);
    console.log(`Swap Router deployed to:`, chalk.green(swapRouter.address));
  } catch (e) {
    swapRouterSpinner.stop(true);
    throw e;
  }

  // To save deploy info
  const deployInfo = [
    {
      address: factory.address,
      args: [],
    },
    {
      address: swapRouter.address,
      args: [factory.address, deployConfig.weth],
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
