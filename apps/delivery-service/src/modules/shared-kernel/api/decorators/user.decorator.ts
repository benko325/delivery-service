import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from '../../core/types/user-types';

export const User = createParamDecorator(
    (data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user: RequestUser = request.user;

        if (data) {
            return user?.[data];
        }

        return user;
    },
);
