import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract the current authenticated user from the request
 *
 * Usage:
 * @Controller('some-route')
 * export class SomeController {
 *   @Get()
 *   @UseGuards(AuthGuard)
 *   async getSomething(@CurrentUser() user: AuthenticatedUser) {
 *     // user contains { id, email, tenantId, role }
 *   }
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof any | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    // If a specific property is requested, return that property
    if (data) {
      return user[data];
    }

    // Otherwise return the whole user object
    return user;
  },
);
