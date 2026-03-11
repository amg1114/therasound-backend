import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

import { IS_PUBLIC_KEY } from '../decorators/public-route.decorator';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: any, user: TUser, info: any): TUser {
    if (info?.name === 'JsonWebTokenError') {
      throw new UnauthorizedException('Token de acceso inválido');
    }

    if (info?.name === 'NotBeforeError') {
      throw new UnauthorizedException('Token aún no activo');
    }

    // If there is an error or no user, throw exception
    if (info instanceof Error) {
      throw new UnauthorizedException(info.message);
    }

    if (!user) {
      throw new UnauthorizedException('Authentication failed');
    }

    return user;
  }
}
