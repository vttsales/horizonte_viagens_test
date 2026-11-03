# Horizonte Viagens — frontend integrado

Atualização da interface pública, cliente e administrativa com a identidade azul-marinho/dourado e o catálogo original. Conteúdo extraído de `PIM - Horizonte (Web)/index.html` do repositório fornecido.

## O que foi preservado

| Destino | Valor | Evento |
| --- | ---: | --- |
| Paris | R$ 15.000,00 | Semana de Moda de Paris |
| Tóquio | R$ 18.000,00 | Festival Hanami (Cherry Blossom) |
| Nova York | R$ 12.000,00 | Broadway + Times Square NYE |
| Porto Seguro | R$ 4.500,00 | Carnaval de Porto Seguro |
| Ubatuba | R$ 3.200,00 | Festival de Surf de Ubatuba |
| Florianópolis | R$ 5.500,00 | Fenaostra — Festival da Ostra |

Também preservados: durações, inclusões, parcelamentos, hotéis, valores das diárias e edições dos eventos. Os preços riscados e percentuais originais permanecem no arquivo de catálogo para rastreabilidade, mas não são apresentados como promoção vigente. Datas vencidas são identificadas como edição cadastrada, com próximas saídas sob consulta. Não foram criadas datas futuras ou preços novos.

O parcelamento original de Ubatuba foi mantido literalmente (`6x de R$ 533,33`), embora a soma seja R$ 3.199,98. A equipe deve definir o ajuste de centavos no pagamento; o total do pacote permanece R$ 3.200,00.

## Telas e navegação

- `#inicio`, `#explorar`, `#eventos`, `#hoteis`, `#como-funciona`, `#ajuda`.
- `#entrar`, `#cadastro` e recuperação de senha.
- `#cliente`, `#cliente/viagens`, `#cliente/carteira`, `#cliente/favoritos`, `#cliente/perfil`.
- `#admin`, `#admin/pacotes`, `#admin/reservas`.

Não há alternador de perfis, login local ou criação de reservas no navegador. As telas privadas exigem uma sessão retornada pelo backend. A carteira está alinhada à proposta do Flutter: consultar documentos emitidos, sem fabricar QR ou chaves de assinatura no frontend.

## Executar o frontend

Requer Node.js 20 ou superior; não há dependências para instalar.

```sh
node server.mjs
```

Abra `http://127.0.0.1:8081`. Use servidor HTTP, não o protocolo `file:`.

```sh
node --test --test-isolation=none tests/core.test.mjs
node --check dist/app.js
```

Se a versão local de Node não suportar `--test-isolation=none`, use `node --test tests/core.test.mjs` em um ambiente que permita processos filhos.

## Integração com o PIM

`dist/` é a edição estática para revisar e publicar o frontend. **Ela não substitui a aplicação ASP.NET Core MVC exigida pelo manual.**

`mvc/Horizonte.Web/` contém um ponto de partida de apresentação MVC/Razor: layout, views, controllers de navegação e proteção de rotas por cookie/papel. O mesmo frontend é reutilizado em `wwwroot/horizonte`. As views são contêineres Razor com fallback e a interface dinâmica é renderizada pelo JavaScript; a equipe pode progressivamente movê-la para partial views tipadas.

Esse projeto não implementa as outras quatro camadas da solution nem o backend de negócio. Deve ser incorporado ao `Horizonte.Web` da equipe, que deve chamar `Horizonte.Negocio`; o Flutter chama `Horizonte.Api`, compartilhando as camadas de Negócio e Repositório.

Leia `docs/INTEGRACAO.md` antes de habilitar os serviços. Os caminhos `/interface/...` são um contrato proposto para controllers MVC que respondem JSON, não uma API já existente. Não apontar o site diretamente para o SQL Server.

Em `dist/config.js`, `servicesEnabled` está `false`. Na publicação estática, login, cadastro, cotação, pagamento e gravações retornam indisponibilidade sem enviar dados. Ative apenas após implementar os endpoints reais. A tela não contém avisos de demonstração, mas isso não significa que o backend esteja implementado.

## Segurança e dados

- Nenhum usuário, senha, token, compra ou indicador é fabricado no navegador.
- Sessão esperada: cookie seguro HttpOnly definido pelo servidor.
- Mutações: JSON parametrizado, mesma origem e token antiforgery.
- Autorizações de cliente/admin e acesso a cada reserva devem ser aplicados no servidor.
- O valor final e a disponibilidade vêm de `/quotes`; não são calculados a partir do preço do HTML.
- Pagamento é redirecionado a um endereço HTTPS retornado pelo backend; o site não coleta cartão nem gera Pix.
- Documentos e QR devem ser emitidos/autorizados pelo servidor. Nenhuma chave do Flutter é copiada para o site.

## Validação desta entrega

12 testes automatizados passaram: fidelidade de conteúdo, filtros, datas vencidas, acesso, tratamento de falhas, antiforgery e exportação. Interface pública e login foram conferidos no navegador, incluindo viewport de 390 px. Fluxos autenticados, pagamento e compilação .NET dependem do ambiente e dos serviços da equipe; não foram validados ponta a ponta.

## Arquivos

- `dist/catalog.js`: catálogo fiel ao original.
- `dist/app.js`: telas, navegação e interações.
- `dist/services.js`: transporte e tratamento de erros.
- `dist/config.js`: ativação e prefixo dos serviços.
- `dist/core.js`: filtros, formatação e utilitários.
- `dist/styles.css` e `product.css`: identidade e responsividade.
- `docs/catalogo-original.json`: referência dos conteúdos extraídos.
- `docs/INTEGRACAO.md`: contrato proposto e responsabilidades do servidor.
- `mvc/Horizonte.Web`: base de integração da apresentação no ASP.NET Core MVC.

Fotografias ilustrativas: origens em `ASSETS.md`. Fontes Google Fonts com fallback local.
