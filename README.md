# 🪐 Sol View

Пет-проект для изучения стека Solana. Дашборд на Vue 3 + TypeScript для
просмотра кошелька — баланс, история транзакций и NFT-галерея, по подключённому
кошельку или любому введённому адресу.

[![Демо](https://img.shields.io/badge/демо-online-42b883?style=for-the-badge)](https://echora-1.github.io/SolVIew/)

## Возможности

- 🔌 Подключение кошелька (Phantom, Solflare) или ручной ввод адреса —
  с валидацией через `vee-validate` + `zod`
- 💰 Баланс кошелька в SOL
- 📜 История последних транзакций (время, изменение баланса, статус) со ссылками
  на Solana Explorer
- 🖼️ Галерея NFT — включая compressed NFT (через DAS API) — с деталями по клику
- 🔗 Шарящиеся ссылки — активный адрес сохраняется в URL
- 🛡️ Устойчивый RPC-слой — ретраи с экспоненциальным backoff на `429`, ошибки
  показываются тостами, блоки дашборда падают независимо

## Стек

| Область     | Технологии                                       |
| ----------- | ------------------------------------------------ |
| Фреймворк   | Vue 3                                            |
| Состояние   | Pinia                                            |
| Валидация   | vee-validate + zod                               |
| Блокчейн    | @solana/web3.js, solana-wallets-vue              |
| NFT         | DAS API + @metaplex-foundation/umi               |
| Стили       | Tailwind CSS                                      |
| Тесты       | Vitest                                            |

## Запуск

```bash
npm install
npm run dev
```

По умолчанию приложение работает с публичной нодой `mainnet-beta`. Публичные ноды
ограничены по частоте запросов, а NFT-галерея использует DAS API — поэтому для
полноценной работы укажите свой RPC (например, Helius):

```bash
cp .env.example .env
# затем задайте VITE_RPC_URL, например эндпоинт Helius
```

## Скрипты

| Команда           | Описание                              |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Запуск dev-сервера Vite               |
| `npm run build`   | Проверка типов и сборка для продакшена |
| `npm run preview` | Предпросмотр продакшен-сборки         |
| `npm test`        | Запуск юнит-тестов                    |

## Структура проекта

```
src/
├── components/        # WalletConnect, SearchForm, BalanceCard, TransactionTable,
│   │                  # NftGallery, NftCard, NftModal, NftPlaceholder, CopyableValue
│   └── ui/            # SkeletonBox, EmptyState, ToastHost
├── composables/       # useSolana (запросы к RPC), useAsyncData, useToast
├── views/             # DashboardView, TransactionsView, NftsView
├── stores/            # useWalletStore (активный адрес)
├── schemas/           # zod-схема адреса
├── lib/               # connection, форматирование, обработка ошибок RPC
├── router/            # маршруты
└── types/             # общие типы ответов
```
