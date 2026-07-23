let tonConnectUI = null;
let walletAddress = null;

export async function initWallet() {
  try {
    const { TonConnectUI } = await import('@tonconnect/ui');
    tonConnectUI = new TonConnectUI({
      manifestUrl: 'https://raw.githubusercontent.com/recksach/chronogram-infinity/main/tonconnect-manifest.json',
    });
    tonConnectUI.onStatusChange((wallet) => {
      walletAddress = wallet ? wallet.account.address : null;
    });
    return tonConnectUI;
  } catch (e) {
    console.warn('TonConnect not available:', e.message);
    return null;
  }
}

export async function connectWallet() {
  if (!tonConnectUI) await initWallet();
  if (!tonConnectUI) return null;
  try {
    await tonConnectUI.openModal();
    if (tonConnectUI.wallet) {
      walletAddress = tonConnectUI.wallet.account.address;
      return walletAddress;
    }
  } catch (e) {
    console.warn('Wallet connect failed:', e.message);
  }
  return null;
}

export function getWalletAddress() { return walletAddress; }

const APE_CONTRACT = 'EQBjoywW-EZyePew5wwnwFtjWsW1OAySB-3Pt71huH20bzUD';
const ADMIN_WALLET = 'UQAGpJWn-FJd3wjB-aiChuiYH-9tdXAOhqu887uBtS1Ce4_7';

export async function buyApe(tonAmount) {
  if (!tonConnectUI || !walletAddress) {
    alert('Please connect your TON wallet first');
    return false;
  }
  try {
    const nanoTon = Math.floor(tonAmount * 1e9);
    const payload = {
      validUntil: Math.floor(Date.now() / 1000) + 360,
      messages: [{
        address: ADMIN_WALLET,
        amount: String(nanoTon),
      }]
    };
    const result = await tonConnectUI.sendTransaction(payload);
    if (result) {
      const apeAmount = Math.floor(tonAmount * 15674);
      alert(`Transaction sent! You will receive ~${apeAmount.toLocaleString()} $APE`);
      return true;
    }
  } catch (e) {
    if (e.message !== 'Wallet was closed') {
      alert('Transaction failed: ' + e.message);
    }
  }
  return false;
}

export async function sellApe(apeAmount) {
  if (!tonConnectUI || !walletAddress) {
    alert('Please connect your TON wallet first');
    return false;
  }
  const { store } = await import('./store.js');
  if (store.state.apeBalance < apeAmount) {
    alert('Insufficient $APE balance');
    return false;
  }
  alert(`Sell request for ${apeAmount.toLocaleString()} $APE submitted. Contact @Superadminist to complete the swap.`);
  return true;
}
