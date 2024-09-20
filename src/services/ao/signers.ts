import { connect } from '@permaweb/aoconnect';
import { EthereumSigner, InjectedEthereumSigner, createData } from 'arbundles';
import { BrowserProvider } from 'ethers';

const ethersProvider = new BrowserProvider(window?.ethereum);

/**
 * @param ethersProvider - BrowserProvider
 * @returns signer
 */
export function createBrowserEthereumDataItemSigner(
  ethersProvider: BrowserProvider,
) {
  /**
   * createDataItem can be passed here for the purposes of unit testing
   * with a stub
   */
  const signer = async ({ data, tags, target, anchor }: any) => {
    const ethersSigner = await ethersProvider.getSigner();
    const provider = {
      getSigner: () => ({
        signMessage: (message: any) => ethersSigner.signMessage(message),
      }),
    };
    const ethSigner = new InjectedEthereumSigner(provider as any);
    await ethSigner.setPublicKey();
    const dataItem = createData(data, ethSigner, { tags, target, anchor });

    const res = await dataItem
      .sign(ethSigner)
      .then(async () => ({
        id: await dataItem.id,
        raw: await dataItem.getRaw(),
      }))
      .catch((e) => console.error(e));

    console.dir(
      {
        valid: await EthereumSigner.verify(
          ethSigner.publicKey,
          await dataItem.getSignatureData(),
          dataItem.rawSignature,
        ),
        signature: await dataItem.signature,
        owner: await dataItem.owner,
        tags: await dataItem.tags,
        id: await dataItem.id,
        res,
      },
      { depth: 2 },
    );
    return res;
  };

  return signer;
}

const ao = connect();

export async function spawn() {
  // connect to metamask
  await ethersProvider.send('eth_requestAccounts', []);
  const dataItemSigner = createBrowserEthereumDataItemSigner(ethersProvider);

  const res = await ao.spawn({
    module: 'nI_jcZgPd0rcsnjaHtaaJPpMCW847ou-3RGA5_W3aZg',
    scheduler: '_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA',
    signer: dataItemSigner as any,
  });

  console.log('spawn', res);
  return res;
}
