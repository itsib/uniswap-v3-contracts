import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import * as bip39 from 'bip39';
import chalk from 'chalk';
import * as dotenv from 'dotenv';
import 'hardhat-abi-exporter';
import 'hardhat-gas-reporter';
import { HardhatUserConfig, task } from 'hardhat/config';
import 'solidity-coverage';

dotenv.config();

task('balance', "Prints an account's balance").setAction(async (taskArguments, hre) => {
  const signers = await hre.ethers.getSigners();
  if (!signers.length) {
    console.log(chalk.red('No signer for selected network. Please add wallet private key to .env file'));
    return;
  }

  for (const signer of signers) {
    const balance = await signer.getBalance('latest');
    const address = signer.address;
    console.log(`${chalk.yellow(address)}: ${chalk.whiteBright(hre.ethers.utils.formatEther(balance))}`);
  }
});

task('mnemonic', 'Generate a random mnemonic (uses crypto.randomBytes under the hood), defaults to 128-bits of entropy').setAction(async () => {
  const mnemonic = bip39.generateMnemonic();
  console.log(`Your mnemonic phrase:`);
  console.log(`${chalk.green(mnemonic)}`);
});

const config: HardhatUserConfig = {
  solidity: {
    version: '0.7.6',
  },
  networks: {
    hardhat: {
      loggingEnabled: true,
      accounts:
        process.env.HARDHAT_PRIVATE_KEY !== undefined
          ? [
              {
                privateKey: process.env.HARDHAT_PRIVATE_KEY,
                balance: `100${'0'.repeat(18)}`,
              },
            ]
          : [],
      // hardfork: 'berlin',
    },
    goerli: {
      url: process.env.GOERLI_URL,
      accounts: process.env.GOERLI_PRIVATE_KEY !== undefined ? [process.env.GOERLI_PRIVATE_KEY] : [],
      gasPrice: 3_000_000_000,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
  },
  etherscan: {
    apiKey: {
      goerli: process.env.ETHERSCAN_API_KEY ?? '',
    },
  },
  abiExporter: {
    path: './abi',
    only: ['GasStation', 'IExchange'],
    spacing: 2,
    flat: true,
    clear: true,
  },
};

export default config;
