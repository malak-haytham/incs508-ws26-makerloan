import { Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CookieOptions, Request, Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ErrorResponseDto } from '../common/error-response.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ACCESS_COOKIE, REFRESH_COOKIE } from './jwt.strategy';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService, private config: ConfigService) {}

  private cookieOpts(maxAgeMs: number): CookieOptions {
    return {
      httpOnly: true,
      secure: this.config.get('COOKIE_SECURE', 'true') !== 'false',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeMs,
    };
  }
  private setCookies(res: Response, t: { accessToken: string; refreshToken: string }) {
    res.cookie(ACCESS_COOKIE, t.accessToken, this.cookieOpts(15 * 60 * 1000));
    res.cookie(REFRESH_COOKIE, t.refreshToken, this.cookieOpts(7 * 24 * 60 * 60 * 1000));
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Log in. Tokens are set as httpOnly cookies, never in the body.' })
  @ApiResponse({ status: 200, description: 'Logged in; returns the user (no password hash).' })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.auth.login(dto.email, dto.password);
    this.setCookies(res, { accessToken, refreshToken });
    return user;
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiCookieAuth(REFRESH_COOKIE)
  @ApiOperation({ summary: 'Rotate tokens using the refresh cookie.' })
  @ApiResponse({ status: 200, description: 'New cookies set.' })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    this.setCookies(res, await this.auth.refresh(req.cookies?.[REFRESH_COOKIE]));
    return { refreshed: true };
  }

  @Post('logout')
  @HttpCode(200)
  @ApiCookieAuth(ACCESS_COOKIE)
  @ApiOperation({ summary: 'Clear auth cookies and revoke the refresh token.' })
  async logout(@CurrentUser() user: any, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(user.id);
    res.clearCookie(ACCESS_COOKIE, { path: '/' });
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
    return { loggedOut: true };
  }

  @Get('me')
  @ApiCookieAuth(ACCESS_COOKIE)
  @ApiOperation({ summary: 'Current user (loaded from DB).' })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  me(@CurrentUser() user: any) {
    return user;
  }
}
