import { createParamDecorator, ExecutionContext } from '@nestjs/common';
/** Injects the DB-loaded user (set by JwtStrategy.validate). */
export const CurrentUser = createParamDecorator((_d: unknown, ctx: ExecutionContext) =>
  ctx.switchToHttp().getRequest().user,
);
