# MedArquivo - protótipo React

Protótipo de telas para organização de exames e laudos da Policlínica Regional de SAJ.

## Executar

```sh
npm install
npm run dev
```

`npm run build` gera a versão de produção em `dist`.

## Escopo

- Login local com e-mail e senha. Na primeira entrada, configure as credenciais do administrador inicial.
- Cadastro, edição e exclusão de usuários pelo administrador; edição do próprio perfil e senha. Não envia e-mails.
- Importação de arquivos ou de uma pasta, busca por paciente e referência.
- Prévia de PDF e imagens PNG/JPEG/WebP/GIF, com download para outros formatos.
- Status, observações e exclusão confirmada de documentos.

A camada `src/lib/localStore.js` concentra a persistência para futura substituição por uma API local. A importação usa uma transação única para evitar pastas parcialmente importadas. URLs temporárias da visualização são liberadas quando a janela é fechada.

## Verificação manual

1. Configurar o e-mail e a senha inicial do administrador, entrar e cadastrar um profissional fictício.
2. Importar uma pasta com PDF e imagem, autorizando o profissional.
3. Abrir a pasta, visualizar os dois formatos e baixar um arquivo.
4. Recarregar a página e conferir a persistência; alterar status e salvar observações.
5. Sair, entrar como profissional e conferir as pastas permitidas e a ausência do cadastro de usuários.
6. Editar o próprio perfil e verificar que profissionais não alteram o perfil de acesso.
7. Como administrador, editar e excluir um usuário, verificando a preservação das pastas.
8. Conferir a mensagem de formato sem prévia e o cancelamento da exclusão.

## Fluxo de laudos

A página inicial agora lista laudos. Médicos criam laudos em `/laudos/novo` com os campos da referência de ultrassonografia: identificação, solicitante, equipamento, descrição, impressão diagnóstica e avaliação interna do pedido. Os demais tipos usam uma estrutura provisória até o recebimento dos modelos específicos.

As imagens JPG, PNG e WebP podem vir de uma pasta, de arquivos selecionados ou das pastas já importadas. É possível adicionar legendas, remover e ordenar imagens. A prévia apresenta até quatro imagens por página anexa, depois do texto do laudo, sem bloco de assinatura nos anexos. Textos longos podem ocupar mais de uma página. Use “Imprimir / Salvar PDF” e selecione o destino PDF do navegador; desative os cabeçalhos e rodapés do navegador, se necessário.

O administrador pode consultar e arquivar laudos, mas não preencher o conteúdo clínico. O médico responsável pode salvar rascunhos e concluir a revisão. Documentos revisados ficam bloqueados; assinatura digital e versionamento ainda precisam de integração. Nenhum documento é marcado como assinado. O cabeçalho é uma representação textual provisória: as marcas oficiais devem ser fornecidas para reprodução fiel.

A atualização de IndexedDB para a versão 2 acrescenta os laudos sem apagar usuários, pastas e documentos anteriores. Os dados continuam locais ao navegador.

Testes: `node --test tests/*.test.js`.
