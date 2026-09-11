# PayGo Card

Protótipo independente do PayGo para testar a integração com a Bridgecard antes da integração no produto principal.

## O que já existe

- Console web para testar a API Bridgecard
- Selector Sandbox / Production
- Health check
- Listagem de cardholders
- Listagem de cartões
- Consulta de detalhes do cartão
- Consulta de saldo
- Consulta de transações
- Proxy server-side para manter tokens e secrets fora do browser

## Bridgecard

A Bridgecard usa ambientes separados de sandbox e produção. O sandbox tem a mesma implementação base da produção e é indicado para desenvolvimento. Consulte a documentação oficial antes de ativar operações de produção.

Docs: https://docs.bridgecard.co/introduction

## Vercel

1. Importar `Jaylowkey/paygo-card` como um novo projeto.
2. Adicionar as quatro variáveis de ambiente de `.env.example`.
3. Para o primeiro deploy, preencher apenas `BRIDGECARD_TEST_TOKEN` e `BRIDGECARD_TEST_SECRET`.
4. Fazer o deploy.

Nunca coloque tokens Bridgecard diretamente em `public/` ou no código do browser.
