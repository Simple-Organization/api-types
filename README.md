# simorg-api-typify

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

Exemplo de `Context` com `Fastify`

```ts
// Não é necessário que seja uma classe, isso é só um exemplo usando classe
export class ApiContext {
  #request: FastifyRequest;
  #reply: FastifyReply;

  constructor(request: FastifyRequest, reply: FastifyReply) {
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

### Usando no `Fastify` ou `Express`

Apesar desse exemplo ser para o `Fastify`, ele pode ser facilmente adaptado para outras `api`

Uma vez que temos o objeto `apiRoutes`, nós devemos criar o objeto otimizado para o `Fastify`, criamos com o método `optimizeApiRoutes`

```ts
const optimized = optimizeApiRoutes(apiRoutes);
```

E assim no `Fastify` podemos acessar as rotas seguindo o exemplo abaixo

```ts
app.post('/api/*', async (req, reply) => {
  const routePath = req.originalUrl.replace('/api/', '');

  const func = optimizedRoutes[routePath];

  if (!func) {
    return reply.status(404).send({ error: 'Route not found' });
  }

  const context = new ApiContext(req, reply); // Aqui nós criamos o ApiContext

  try {
    const result = await func(context, req.body);
    reply.status(200).send(result);
  } catch (error: any) {
    // Exemplo dando suporte ao zod
    if (error instanceof ZodError) {
      reply.status(400).send({ error: error.toString() });
      return;
    }

    reply.status(500).send({ error: error + '' });
  }
});
```

Nesse exemplo acima, a `api` seria chamada usando `/api/custumer.get`, você pode configurar a chamada para ser `/api/custumer/get` passando um argumento adicional ao `optimizeApiRoutes`

```ts
const optimized = optimizeApiRoutes(apiRoutes, '/');
```

## Configurando no frontend

Usamos o `createApiProxy` no `frontend` e precisamos acessar a tipagem do `apiRoutes`

```ts
const api = createApiProxy<typeof apiRoutes>((path, args) => {
  return fetch('/api/' + path, {
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

## HTTP Errors

## HTTP Errors

Starting from version `1.0.0-next.2`, the `simorg-api-typify` package introduces a set of HTTP error classes that can be used to handle and respond to different types of HTTP errors in a consistent and standardized way.

To use the HTTP error classes, simply import the desired error class from the `http-errors` module and throw it whenever an error occurs. For example:

```ts
import { BadRequestError } from 'simorg-api-typify/http-errors';

export function getCustumer(context: Context, body: { id: number }) {
  if (typeof body.id !== 'number') {
    throw new BadRequestError('body.id must be a number');
  }

  // ...
}
```
