import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { LoginCommand } from './login.command';
import { IAuthRepository } from '../../../core/repositories/auth.repository.interface';
import { AuthAggregate } from '../../../core/aggregates/auth.aggregate';
import { AuthConfigService } from '../../../infrastructure/config/auth-config.service';
import { JwtPayload } from '../../../../shared-kernel/core/types/user-types';

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        roles: string[];
    };
}

@CommandHandler(LoginCommand)
export class LoginCommandHandler implements ICommandHandler<LoginCommand> {
    constructor(
        @Inject('IAuthRepository')
        private readonly authRepository: IAuthRepository,
        private readonly jwtService: JwtService,
        private readonly configService: AuthConfigService,
    ) {}

    async execute(command: LoginCommand): Promise<LoginResponse> {
        const user = await this.authRepository.findByEmail(command.email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const authAggregate = new AuthAggregate();
        authAggregate.loadState(user);

        const isPasswordValid = await authAggregate.validatePassword(command.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            roles: user.roles,
        };

        const accessToken = this.jwtService.sign(payload as object);
        const refreshToken = this.jwtService.sign(payload as object, {
            expiresIn: this.configService.jwtRefreshExpiresIn,
        } as JwtSignOptions);

        await this.authRepository.updateRefreshToken(user.id, refreshToken);

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                roles: user.roles,
            },
        };
    }
}
