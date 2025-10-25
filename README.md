# ⚽ BetAware

Um aplicativo mobile em **React Native** desenvolvido durante a Sprint Acadêmica, com o objetivo de conscientizar sobre os riscos das apostas esportivas. A plataforma permite que o usuário simule apostas fictícias, visualize relatórios detalhados de desempenho e acompanhe seu comportamento ao longo do tempo.

---

## 🌐 Integração com API REST

O aplicativo está integrado com uma **API REST** desenvolvida em Spring Boot e hospedada no **Render**:

- **URL da API**: `https://betawarenodeapi.onrender.com/api/v1`
- **Funcionalidades**:
  - Autenticação JWT (login/registro)
  - Gerenciamento de apostas (CRUD)
  - Sincronização de dados entre dispositivos
  - Validação de dados no servidor

### ⚠️ Limitações da Hospedagem Gratuita (Render)

- **Cold Start**: A API pode demorar 30-60 segundos para responder na primeira requisição após inatividade
- **Timeout**: Conexões podem falhar por timeout durante o cold start
- **Recursos Limitados**: CPU e memória limitados podem causar lentidão
- **Disponibilidade**: Pode haver instabilidade ocasional do serviço gratuito
- **Hibernação**: O serviço hiberna após 15 minutos de inatividade

### 🔄 Estratégias de Mitigação

O aplicativo implementa várias estratégias para lidar com essas limitações:

1. **Verificação de Saúde da API**: Checagem automática a cada 30 segundos
2. **Fallback Offline**: Funcionamento completo sem conexão com a API
3. **Retry Logic**: Tentativas automáticas de reconexão
4. **Cache Local**: Dados salvos localmente para acesso imediato
5. **Indicadores Visuais**: Status de conexão visível para o usuário

---

## Repositórios

- **Aplicativo Mobile (React Native):** [https://github.com/pedrobicas/BetAwareApp](https://github.com/pedrobicas/BetAwareApp)
- **Aplicação Web (Angular):** [https://github.com/pedrobicas/BetAwareWeb](https://github.com/pedrobicas/BetAwareWeb)
- **API (SpringBoot):** [https://github.com/pedrobicas/BetAwareAPI](https://github.com/pedrobicas/BetAwareAPI)
---

## 🎨 Protótipo no Figma

- [🔗 Protótipo do Figma](https://www.figma.com/design/d9LYsdSEWWUUzPges1iwfL/BetAware?node-id=0-1&t=C0BW4G2tcF60FcfY-1)

---

## 🎯 Objetivo

O aplicativo **não envolve dinheiro real**, sendo voltado para **autoavaliação e controle emocional**. Ele simula uma experiência de apostas com foco em:

- Monitorar ganhos, perdas e saldo.
- Estimular o uso consciente e saudável das apostas.
- Promover reflexão com notícias e relatórios visuais.
- Acompanhar padrões de comportamento.

---

## 🧪 Funcionalidades

- ✅ Cadastro e login de usuário (com CPF e CEP).
- ✅ Simulação de apostas em jogos fictícios.
- ✅ Histórico de apostas armazenado localmente.
- ✅ Relatórios com **gráfico de pizza** e **barras**.
- ✅ Filtros por período (últimos 7 dias, 30 dias e total).
- ✅ Dashboard com saldo, total de apostas, ganhos e perdas.
- ✅ Tema visual **inspirado em futebol**.
- ✅ Modo escuro (dark mode) compatível.
- ✅ Seção de **notícias** sobre vício em apostas.
- ✅ Armazenamento com `AsyncStorage`.
- ✅ **Integração com API REST** hospedada no Render.
- ✅ **Modo Offline** completo:
  - Login e cadastro offline
  - Criação e listagem de apostas
  - Sincronização automática quando online
  - Indicador visual de status offline
  - Verificação periódica de conexão
  - Fallback automático para dados locais

---

## 🛠️ Tecnologias Utilizadas

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit)
- [Axios](https://axios-http.com/) para requisições HTTP
- `TypeScript`
- `Expo Router`

---

## 🚀 Como Rodar o Projeto

1. Clone o repositório:
   ```bash
   git clone https://github.com/pedrobicas/BetAwareApp.git
   cd BetAwareApp
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o projeto com o Expo:
   ```bash
   npx expo start
   ```

4. Use o app no seu celular:
   - Baixe o app **Expo Go** na App Store ou Google Play.
   - Escaneie o QR Code gerado no terminal.

---

## 🔄 Funcionamento Offline

O aplicativo foi projetado para funcionar completamente offline:

1. **Verificação de Conexão**:
   - Checagem automática a cada 30 segundos
   - Indicador visual de status offline
   - Fallback automático para dados locais

2. **Armazenamento Local**:
   - Dados de usuário
   - Histórico de apostas
   - Configurações do app
   - Token de autenticação

3. **Sincronização**:
   - Dados são salvos localmente primeiro
   - Sincronização automática quando online
   - Resolução de conflitos de dados

---

## 👨‍💻 Time de Desenvolvimento

- Felipe Terra – RM 99405
- Pedro Bicas – RM 99534
- Gabriel Doms – RM 98630
- Lucas Vassão – RM 98607
- Bryan Willian – RM 551305

---

## 💡 Ideias Futuras

- Exportação do histórico em PDF.
- Notificações personalizadas sobre comportamento compulsivo.
- Ranking de autocontrole com gamificação.
- Sincronização em tempo real com WebSocket.
- Backup automático dos dados locais.
- Migração para hospedagem paga para melhor performance da API.

---

## ⚠️ Aviso

Este aplicativo é **fictício** e tem caráter **educativo/conscientizador**. Nenhuma funcionalidade está ligada a apostas reais.

---

## 📄 Licença

Este projeto é acadêmico e não possui fins comerciais.
