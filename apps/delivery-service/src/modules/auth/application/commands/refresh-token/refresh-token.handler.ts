import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, UnauthorizedException } from "@nestjs/common";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { RefreshTokenCommand } from "./refresh-token.command";
import { IAuthRepository } from "../../../core/repositories/auth.repository.interface";
import { AuthConfigService } from "../../../infrastructure/config/auth-config.service";
import { JwtPayload } from "../../../../shared-kernel/core/types/user-types";
import { MetricsService } from "../../../../shared-kernel/infrastructure/metrics";

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenCommandHandler implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    @Inject("IAuthRepository")
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: AuthConfigService,
    private readonly metricsService: MetricsService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<RefreshTokenResponse> {
    try {
      const decoded = this.jwtService.verify<JwtPayload>(command.refreshToken);

      const user = await this.authRepository.findById(decoded.sub);

      if (!user || user.refreshToken !== command.refreshToken) {
        this.metricsService.incrementTokenRefresh("failure");
        throw new UnauthorizedException("Invalid refresh token");
      }

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        roles: user.roles,
      };

      const accessToken = this.jwtService.sign(payload as object);
      const refreshToken = this.jwtService.sign(
        payload as object,
        {
          expiresIn: this.configService.jwtRefreshExpiresIn,
        } as JwtSignOptions,
      );

      await this.authRepository.updateRefreshToken(user.id, refreshToken);

      this.metricsService.incrementTokenRefresh("success");

      return {
        accessToken,
        refreshToken,
      };
    } catch {
      this.metricsService.incrementTokenRefresh("failure");
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }
}
