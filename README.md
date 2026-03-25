<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/e660815e-40c5-49ef-810b-176980bb59bd

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Prompts
Crie um aplicativo web chamado “Cardapio da Galera”, responsivo (mobile-first) com UI moderna em modo escuro, focado auxiliar na lista de mercado em momentos em que vamos em grupo para uma casa de veraneio

STACK
- React + TypeScript
- Tailwind CSS
- Sem backend e sem banco de dados por enquanto (usar dados mock/local).
- Estruturar o código para permitir conectar um banco depois sem reescrever telas.

OBJETIVO
Entregar o FRONT 100% funcional: telas, navegação, formulários, validações, estados de loading, e CRUD completo usando um “Mock Data Layer”.

ARQUITETURA (IMPORTANTE)
- Criar pasta /services com:
  - mockService.ts (implementação atual)
  - interface/types.ts (tipos e interfaces)
- Todas as telas devem consumir apenas funções do service:
  - getUsuarios, createUsuario, updateUsuario, deleteUsuario
  - getIngredientes, createIngrediente, updateIngrediente, deleteIngrediente
  - getPratos, createPrato, updatePrato, deletePrato
  - getEventos, createEvento, updateEvento, deleteEvento
  - getRefeicoes, createRefeicao, updateRefeicao, deleteRefeicao
  - getIngredientesEventos
- O mockService deve persistir no localStorage (para manter dados após refresh).
- Preparar um arquivo supabaseService.ts vazio (apenas stub) com as mesmas funções, para plugar depois.


## Login de autenticação Usuario
Login (FAKE)
- Tela de login só para simular UX
- Aceitar qualquer email/senha
Sistema deve permitir o cadastro por email de cada usuario, permitindo o usuario cadastrar uma senha com no minimo 6 caracteres.
Campos... nome, email, senha, cidade, estado, telefone (opcional)

## Cadastro de ingredientes
Sistema deverá permitir o cadastro de ingredientes que contenham no mercado, não podendo repetir o nome, os ingredientes poderam deverão ser publicos, então todo usuario poderá ter acesso a todos os ingredientes cadastrados
Relação: Ingrediente tem um usuario

## Cadastro de pratos
Sistema deve conter uma tela, onde o usuario cadastre o nome de um prato e nele colocar a quantidade de cada item necessita para montar o prato, quantidade deve ser de uma casa decimal somente. Os ingredientes deverão ser adicionados ao prato, juntamente com a sua quantidade que cada participante precisa para poder se alimentar desse prato.
Sistema deve permitir também que caso o ingredientes não esteja cadastrado, cadastre automaticamente na base de dados, sem a necessidade de acessar a tela de cadastro de ingredientes, disponiblizando um auto-complete do item cadastrado, na sequencia ele preenche a unidade medida desejada (g, ml, unidade)
Pratos poderam ser publicos ou privados, caso seja privado, isso siginifica que se for privado, somente ele poderá associar esse prato a um evento, caso seja publico, outros usuarios poderam associar, mas não poderam editar o prato, mantendo a autenticidade do prato.
Relação: Prato tem um usuario e seus N ingredientes

## Cadastro de evento
Sistema deve conter uma tela, onde o usuario podera cadastrar um evento, contendo nome do evento, dia de inicio do evento e fim do evento e também poderá cadastrar os participantes que irão no evento, cada participante poderá ser marcado como refeição interia ou meia
Relação: Evento tem um usuario e seus N participantes

## Cadastro de refeição
Sistema deve permitir o usuario associar um dos pratos cadastrados no evento, podendo selecionar se é café da manhã, almoço, café da tarde, janta ou lanche da madrugada e qual dia, sempre respeitando o intervalo cadastrado no evento.
Ao cadastrar a alimentação, sistema deverá permitir que ele selecione quais pessoa cadastradas no evento, vão participar dessa refeição, sempre mantendo por padrão em formato de combox todos que estão cadastrados no evento, caso ele necessite, poderá desmarcar e remarcar
Usuario poderá repetir o mesmo prato nas N refeições que ele tiver associadas no evento
Obs: Sempre que salva a refeição, o sistema irá fazer uma copia dos ingredientes do prato estolhido pra dentro da RefeiçãoEventoIngrediente, de forma, garantir que não altere a receita, depois da refeição cadastrada, então caso o prato sofra uma alteração, os ingredientes dessa refeição não sejá alterada, caso o usuario queira atualizar os ingredientes, disponibilize um botão para atualizar
Relação: Refeição estará relacionada a um evento, a um prato com N ingrediente com seus N participantes

## Lista de compras por refeição
Sistema deverá conter uma tela, que gere com base na lista de pratos cadastrados no evento, liste os ingredientes, unidade medida do ingrediente no prato e a quantidade necessaria para fazer cada refeição que possa alimentar a quantidade de pessoas associadas na refeição, respeitando quantidade normal do prato caso a pessoa tenha a marcação de interia, se estiver marcado meia refeição, deverá entender somente metade do que esta associada na refeição, essa pre lista, deve exibir os itens por dia + refeição + nome prato.
Deve conter um botão "Agrupar Ingredientes" onde o sistema deve agrupar todos os ingredientes e unidade medida, e montar uma lista unica, sem repetiros itens e somando a quantidade



##########
Preciso que realize algumas alterações

-> deve bloquear que outros usuarios possam ver e alterar os eventos de outros usuarios
-> permitir que o dono do evento, possa cadastrar um ou mais usuarios na forma de administrar ou visualisar, assim outros usuarios cadastrados possam ter acesso a visualização de algum evento cadastrado
-> na lista de compras deve exibir a quantidade + unidade medida + nome do ingrediente
-> na agrupada, deve exibir na horizontal em um formato texto, que possa copiar para enviar no whatsapp
-> na hora de cadastrar um novo prato deve carregar automaticamente por filtro de contem, os ingredientes já cadastrado para facilitar o uso do que estão já cadastrados
-> deve conter somente as unidades de medidas abrevidas já, são elas UN, GR, ML


##########
Preciso que realize algumas alterações

-> Ajustar o botão do adicionar participante no evento parou de funcionar
-> Botão na tela de ingredientes agrupado, botão de "Copiar Web" alterar para "Copiar lista", também ajuste ele, parou de funcionar
-> Crie um botão para que possa copiar um prato

## Deploy na Vercel

Para colocar o projeto no ar utilizando a Vercel, siga os passos abaixo:

1. Faça o commit e push de todo o código para um repositório no GitHub.
2. Acesse a [Vercel](https://vercel.com/) e faça login com sua conta.
3. Clique em **Add New...** > **Project** e importe o seu repositório do GitHub com este projeto.
4. O framework **Vite** deve ser detectado automaticamente.
   - O comando de build já configurado será `npm run build`
   - O diretório de saída será `dist`
5. Na seção **Environment Variables** (Variáveis de Ambiente), configure as seguintes chaves e seus valores (baseados no seu `.env` local):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
6. Clique em **Deploy** e aguarde o build ser finalizado!

*Nota: O arquivo `vercel.json` já foi criado na raiz do projeto com as regras de roteamento (rewrites) para garantir que a navegação interna do React Router (SPA) funcione corretamente sem apresentar erros 404 ao atualizar a página.*