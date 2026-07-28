let tonConnectUI = null;
let walletAddress = null;
let onStatusChange = null;

export async function initWallet() {
  try {
    const { TonConnectUI } = await import('@tonconnect/ui');
    tonConnectUI = new TonConnectUI({
      manifestUrl: 'https://raw.githubusercontent.com/recksach/chronogram-infinity/main/tonconnect-manifest.json',
    });
    tonConnectUI.onStatusChange((wallet) => {
      walletAddress = wallet ? wallet.account.address : null;
      if (onStatusChange) onStatusChange(walletAddress);
    });
    return tonConnectUI;
  } catch {
    return null;
  }
}

export function setStatusChangeHandler(h) { onStatusChange = h; }

export async function connectWallet() {
  if (!tonConnectUI) await initWallet();
  if (!tonConnectUI) return null;
  try {
    await tonConnectUI.openModal();
    if (tonConnectUI.wallet) {
      walletAddress = tonConnectUI.wallet.account.address;
      return walletAddress;
    }
  } catch {}
  return null;
}

export function disconnectWallet() {
  if (tonConnectUI) tonConnectUI.disconnect();
  walletAddress = null;
}

export function getWalletAddress() { return walletAddress; }
export function isWalletConnected() { return !!walletAddress; }

const APE_CONTRACT = 'EQBjoywW-EZyePew5wwnwFtjWsW1OAySB-3Pt71huH20bzUD';
const ADMIN_WALLET = 'UQAGpJWn-FJd3wjB-aiChuiYH-9tdXAOhqu887uBtS1Ce4_7';
const APE_PER_TON = 15674;

export function getApeRate() { return APE_PER_TON; }

export async function buyApe(tonAmount) {
  if (!tonConnectUI || !walletAddress) return { ok: false, msg: 'connect_wallet_first' };
  try {
    const nanoTon = Math.floor(tonAmount * 1e9);
    const payload = {
      validUntil: Math.floor(Date.now() / 1000) + 360,
      messages: [{
        address: ADMIN_WALLET,
        amount: String(nanoTon),
      }]
    };
    await tonConnectUI.sendTransaction(payload);
    const apeAmount = Math.floor(tonAmount * APE_PER_TON);
    return { ok: true, apeAmount, msg: '' };
  } catch (e) {
    if (e.message && e.message.includes('Wallet was closed')) return { ok: false, msg: '' };
    return { ok: false, msg: 'tx_failed' };
  }
}
