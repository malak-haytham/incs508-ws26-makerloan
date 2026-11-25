import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { UserStatus } from '../common/enums/user-status.enum';
import { UsersService } from '../users/users.service';

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService, private config: ConfigService) {}

  private async issueTokens(userId: string) {
    const accessToken = await this.jwt.signAsync(
      { sub: userId },
      { secret: this.config.getOrThrow('JWT_ACCESS_SECRET'), expiresIn: this.config.get('JWT_ACCESS_TTL', '15m') },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: userId },
      { secret: this.config.getOrThrow('JWT_REFRESH_SECRET'), expiresIn: this.config.get('JWT_REFRESH_TTL', '7d') },
    );
    // sha256 (not bcrypt) for the refresh token: bcrypt only reads the first 72 bytes.
    await this.users.setRefreshHash(userId, sha256(refreshToken));
    return { accessToken, refreshToken };
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmailWithSecrets(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(`Account is ${user.status.toLowerCase()}`);
    }
    const tokens = await this.issueTokens(user.id);
    return { user, ...tokens };
  }

  async refresh(refreshToken?: string) {
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');
    let sub: string;
    try {
      ({ sub } = await this.jwt.verifyAsync(refreshToken, { secret: this.config.getOrThrow('JWT_REFRESH_SECRET') }));
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.users.findByIdWithRefresh(sub);
    if (!user || user.status !== UserStatus.ACTIVE || user.refreshTokenHash !== sha256(refreshToken)) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.issueTokens(user.id);
  }

  logout(userId: string) {
    return this.users.setRefreshHash(userId, null);
  }
}
