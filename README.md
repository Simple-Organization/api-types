# api-types

Prove uma interface entre o `backend` e o `frontend` como o `tRPC` faz

Nesse pacote cada rota da `api` é simplesmente é uma função, aonde o primeiro argumento é o `Context` usado, o resto dos argumentos é definido pelo desenvolvedor

Seguindo esse `pattern` nós podemos fazer diversos tipos de abstrações

## Uso e exemplo

Na `api`

```ts
// Exemplo de rota
export function getCustumer(context: Context, body: { id: number }) {
  // ...
}

// Objeto com todas as rotas disponíveis
const apiRoutes = {
  custumer: {
    get: getCustumer,
    updateCustumer,
  },
  // ...
};
```

No `frontend`

```ts
const custumer = await api.custumer.get(1);
```

## Configurando na `api` (`backend`)

### `Context`

Para a `api` é necessário que o primeiro argumento de cada rota seja um `Context`

O `Context` é um objeto customizado pelo desenvolvedor, o `Context` será de acordo com a implementação que ele use

Exemplo de `Context` com `Fastify` e `node-postgres`

```ts
// Não é necessário que seja uma classe, isso é só um exemplo usando classe
export class ApiContext {
  #database: pg.Client;
  #request: FastifyRequest;
  #reply: FastifyReply;

  constructor(
    database: pg.Client,
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    this.#database = database;
    this.#request = request;
    this.#reply = reply;
  }

  async auth(): Promise<LoggedUser> {
    // ...
  }

  setCookie() {
    // ...
  }
}
```

Recomendamos que no `Context` se abstraia operações com a `api`, para que nos testes você possa chamar uma função com um `mock` do `ApiContext`, não precisa ter `mock` do banco de dados, mas por exemplo, `mock` do `setCookie`, ou já instanciar com o usuário logado por exemplo

### Exemplo de rota

Com o `Context` definido, nós podemos utilizar uma rota qualquer

O recomendado é que o `Context` abstraia todo acesso a implementação do `express` ou `fastify`, do banco de dados é OK ele não abstrair, em alguns casos pode ser interessante também

```ts
export function loadDashboard(context: Context, body: { custumer_id: number, ... }) {
  await context.auth(); // Nesse exemplo auth checa se o usuário está logado

  const custumer = getCustumer(context, body.custumer_id);

  // ...

  return result;
}

//
// O body pode ser um número ao invés de um objeto
export function getCustumer(context: Context, id: number) {
  await context.auth(); // Nesse exemplo auth checa se o usuário está logado

  // ...

  return custumer;
}
```

Nesse exemplo acima `loadDashboard` acessa `getCustumer` chamando como uma subrotina

E como usa o mesmo `context`, é possível que no primeiro `context.auth()` nós fazemos cache do `user` no `Context` e possamos reutizar o mesmo usuário para cada `context.auth` que chamarmos

Para esses casos pode ser interessante implementar um `Context` que impeça que as subrotinas acessem coisas como `.setCookie`

## Configurando no frontend

Usamos o `createApiProxy` no `frontend` e precisamos acessar a tipagem do `apiRoutes`

```ts
const api = createApiProxy<typeof apiRoutes>((path, args) => {
  return fetch(path, {
    method: 'POST',
    body: args[0] ? JSON.stringify(args[0]) : undefined,
  }) //
    .then((res) => res.json());
});
```

Nesse exemplo acima, criamos um objeto `api` que é uma `proxy`, e ele sempre faz requisições com o método `POST`

E com esse exemplo podemos acessar a `api` da seguinte maneira

```ts
const custumer = await api.custumer.get(1);
```

Podemos com o padrão `factory` criar uma `proxy` que receba argumentos adicionais, como por exemplo um `AbortSignal`

```ts
function apiWithSignal(signal: AbortSignal) {
  return createApiProxy<typeof apiRoutes>((path, args) => {
    return fetch(path, {
      method: 'POST',
      body: args[0] ? JSON.stringify(args[0]) : undefined,
      signal,
    }) //
      .then((res) => res.json());
  });
}
```

Agora podemos acessar seguindo o exemplo abaixo

```ts
const custumer = await apiWithSignal(signal).custumer.get(1);
```
