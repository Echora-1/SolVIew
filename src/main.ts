import { createApp } from 'vue'
import { createPinia } from 'pinia'
import SolanaWallets from 'solana-wallets-vue'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import App from './App.vue'
import { router } from './router'
import './style.css'

// Register Phantom and Solflare explicitly so they always appear in the
// connect modal (installed wallets show as detected; others link to install).
createApp(App)
  .use(createPinia())
  .use(router)
  .use(SolanaWallets, {
    // No auto-connect: the wallet connects only on an explicit user action.
    wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    autoConnect: false,
  })
  .mount('#app')
