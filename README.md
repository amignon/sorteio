# Sorteio de apresentações — GitHub Pages

Site estático, responsivo e sem dependências. Usa uma paleta de vermelhos inspirada na identidade visual do Mackenzie (não é uma aplicação oficial da instituição).

## Informar os alunos pela interface

Abra a aba **Alunos** e cole ou digite os nomes, **um aluno por linha**, por exemplo:

```text
Ana Silva
Bruno Souza
Camila Oliveira
```

Clique em **Carregar lista** e confirme. A lista nova substitui a anterior e reinicia o andamento do sorteio. Linhas em branco são ignoradas, e nomes duplicados não são aceitos. Os nomes e o andamento ficam salvos somente neste navegador (`localStorage`).

O arquivo `alunos.js` contém apenas os nomes de exemplo usados na primeira visita. Depois que a turma é carregada pela interface, não é necessário editar arquivos para alterar os nomes.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub (por exemplo, `sorteio-apresentacoes`).
2. Envie `index.html`, `styles.css`, `app.js` e `alunos.js` **na raiz** do repositório (não dentro da pasta do ZIP).
3. No repositório, vá em **Settings → Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**.
5. Em **Branch**, selecione `main`, pasta `/(root)`, e clique em **Save**.
6. A página estará no endereço `https://SEU_USUARIO.github.io/sorteio-apresentacoes/` quando a publicação for concluída.

## Regras

- **Sortear:** escolhe um aluno disponível aleatoriamente.
- **Pode apresentar:** remove o aluno dos disponíveis e coloca na lista de apresentações, preservando a ordem.
- **Colocar em espera:** remove dos disponíveis e inclui na espera.
- **Cancelar sorteio:** não move o aluno; ele segue disponível.
- **Lista esgotada:** se houver alunos em espera, eles retornam automaticamente aos disponíveis.
- **Reiniciar:** exige confirmação e restaura a lista inicial.
- **Resumo:** mostra disponíveis, espera e apresentações.

## Armazenamento

Os dados são salvos em `localStorage` no dispositivo/navegador atual. Não são compartilhados entre computadores ou navegadores. Se o usuário limpar os dados do site, o andamento será perdido. O site não depende de servidor ou banco de dados.
