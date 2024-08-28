export class HTTPError extends Error {
  constructor(
    msg: string,
    readonly status: number,
  ) {
    super(msg);
  }
}

export class BadRequestError extends Error {
  readonly status: number;

  constructor(msg: string) {
    super(msg);
    this.status = 400;
  }
}

export class UnauthorizedError extends Error {
  readonly status: number;

  constructor(msg = 'You are not logged in') {
    super(msg);
    this.status = 401;
  }
}

export class ForbiddenRequestError extends Error {
  readonly status: number;

  constructor(resource: string) {
    super('You are not allowed to access ' + resource);
    this.status = 403;
  }
}
