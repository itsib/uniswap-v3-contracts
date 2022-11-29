export interface DeployConfig {
  weth: string;
}

export const DEPLOY_CONFIG: { [network: string]: DeployConfig } = {
  hardhat: {
    weth: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  },
  goerli: {
    weth: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  },
};
