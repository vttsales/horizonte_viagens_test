# Contrato proposto para o frontend Horizonte

Este contrato ainda precisa ser implementado e alinhado com a equipe. Os endpoints não são inferidos do esquema SQL: há campos de domínio que ainda não existem no banco recebido.

## Arquitetura

Web MVC → Negócio → Repositório → SQL Server.

Flutter → Web API → as mesmas camadas de Negócio e Repositório.

Os endpoints JSON abaixo pertencem a controllers do projeto Web para interação das telas. Eles chamam Negócio por injeção de dependência. Não acessam SQL diretamente e não duplicam regras do projeto Api.

## Convenções

- Prefixo `/interface`; mesma origem do site. JSON em camelCase.
- Sessão por cookie HttpOnly, Secure e política SameSite adequada. O frontend não guarda tokens.
- `GET /csrf` retorna `{ "token": "..." }` e emite o cookie antiforgery. POST, PUT, PATCH e DELETE recebem `X-CSRF-TOKEN`. Renovar após login/logout.
- 401 para sessão ausente/expirada, 403 para falta de permissão, 409 para conflito de disponibilidade/versão, 422 para validação, 429 para limitação e 503 para serviço indisponível. Não redirecionar endpoints JSON para HTML de login.
- Validar todos os dados no servidor. IDs enviados nunca substituem a identidade do usuário autenticado.

## Endpoints

| Método e caminho | Entrada / saída esperada |
| --- | --- |
| GET `/auth/session` | `{ user: null }` ou `{ user: { id, name, email, phone, role } }`. `role` é `Cliente` ou `Admin`, derivado no servidor. |
| POST `/auth/login` | `{ email, password }`; valida credenciais, emite cookie e retorna 204. |
| POST `/auth/register` | `{ name, email, password }`; cria usuário via Negócio, retorna 201. Nunca concede Admin. |
| POST `/auth/recovery` | `{ email }`; resposta genérica sem revelar se a conta existe. |
| POST `/auth/logout` | Invalida a sessão e retorna 204. |
| GET `/catalog` | `{ packages: Package[], hotels: Hotel[] }`; apenas conteúdo público. |
| POST `/quotes` | `{ packageId, departureDate, travelers }`; retorna `{ available, id, total, departureDate, travelers, expiresAtLabel }`. O servidor verifica preços, estoque e validade. |
| POST `/bookings` | `{ quoteId, paymentMethod: "pix" ou "card", requestId }`; usuário identificado pela sessão; cria pedido idempotente e retorna `{ id, paymentUrl }`. |
| POST `/hotels/{id}/availability` | `{ checkIn, checkOut }`; retorna `{ available, total }`. |
| GET `/account/dashboard` | `{ bookings, favoriteIds, packages, summary }`; só dados do cliente. |
| PATCH `/account/profile` | `{ name, phone }`; retorna o usuário atualizado. |
| POST `/account/favorites/{packageId}` | Adiciona favorito do cliente, retorna 204. |
| DELETE `/account/favorites/{packageId}` | Remove favorito do cliente, retorna 204. |
| GET `/account/documents/{id}` | Verifica posse e retorna `{ title, url }` HTTPS com prazo curto. |
| GET `/bookings/{id}/cancellation` | Verifica posse/papel; retorna `{ quoteId, description, refund }`. |
| POST `/bookings/{id}/cancellation` | `{ quoteId }`; aplica a política consultada. Não considerar estorno concluído antes da confirmação do provedor. |
| GET `/admin/dashboard` | Exige Admin; `{ bookings, favoriteIds: [], packages, summary }`. |
| POST `/admin/packages` | Cria pacote validado; retorno 201. Novos pacotes começam pausados. |
| PUT `/admin/packages/{id}` | Edita pacote. Preserva ID/estado e campos não recebidos; valida preço, inclusões e datas. |
| PATCH `/admin/packages/{id}/publication` | `{ active }`; verifica conteúdo e disponibilidade antes de publicar. |

### Package

Campos: `id`, `city`, `name`, `country`, `origin`, `attraction`, `category` (`Luxo`/`Econômico`), `days`, `price`, `installments`, `event`, `eventDates`, `date`, `endDate`, `included` (array de strings), `image` (`paris`, `tokyo`, `newyork`, `beach`, `coast`), `active`.

Datas ISO `yyyy-MM-dd`; valor monetário JSON numérico. No servidor use decimal e defina a unidade do preço: o cadastro original não especifica claramente preço por pessoa versus grupo. O frontend não multiplica o valor do catálogo; a cotação resolve a regra.

### Hotel

Campos: `id`, `name`, `location`, `stars` (texto), `rating` (texto), `price` por noite. Não tratar foto ilustrativa como foto confirmada do hotel.

### Booking

Campos: `id`, `packageId`, `packageName`, `city`, `image`, `date`, `days`, `travelers`, `total`, `customerName`, `status`, `canCancel`, `documents`.

Status exibidos: `Pendente`, `Aguardando pagamento`, `Confirmada`, `Cancelada`. O status financeiro é controlado pelo servidor e pelos webhooks; não existe botão no frontend para declarar arbitrariamente um pagamento confirmado.

`documents`: array de `{ id, type, title }`. A URL de acesso é solicitada separadamente e autorizada no servidor. Documento pode representar passagem, hospedagem ou ingresso. O mesmo conceito atende à carteira Flutter.

### Summary administrativo

`{ confirmedRevenue, activeBookings, activePackages, travelers, destinations: [{ city, count }] }` calculado a partir dos registros do banco. Dados vazios retornam zero; falha de consulta retorna erro, não zero.

## SQL e pagamentos

A procedure entregue anteriormente (`usp_registrar_compra`) precisa ser invocada pela camada Repositório dentro do fluxo definido por Negócio. O SQL atual não tem todos os dados de autenticação, disponibilidade, pedido, pagamento, quantidade de viajantes, favoritos e documentos exigidos por estas telas. A equipe deve modelar os campos/tabelas e as relações antes de habilitar a integração.

Para pagamento, o backend cria a sessão no provedor e devolve o endereço HTTPS autorizado. Não confie em um link retornado pelo cliente. Valide provedores e URLs no servidor. O navegador não recebe chave privada nem dados de cartão. A criação do pedido deve ser idempotente por `requestId` e usuário, inclusive quando houver falha de rede ou expiração da cotação.

## Estrutura MVC entregue

O projeto em `mvc/Horizonte.Web` é um ponto de partida de apresentação, com layout/views Razor e controllers de navegação protegidos. Sem os serviços reais, as rotas `/interface` não implementadas respondem 503. Não há conta padrão, autorização fictícia ou gravação em memória.

Para compor a solution do PIM: integrar os serviços de negócio reais e registrar suas interfaces no Program.cs; referenciar Modelos/Repositório apenas conforme o desenho de dependências definido no manual. O pacote frontend isolado não equivale à entrega dos cinco projetos concluídos.

Referências oficiais para a integração:
- https://learn.microsoft.com/en-us/aspnet/core/security/authorization/roles
- https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery
