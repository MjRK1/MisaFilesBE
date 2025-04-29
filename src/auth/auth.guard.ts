import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService} from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private httpService: HttpService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers['authorization'];

    if (!token) throw new UnauthorizedException('No token');

    try {
      const response = await firstValueFrom(this.httpService.post(
        `http://${process.env.AUTH_HOST}/auth/verify`,
        {},
        {
          headers: { Authorization: token },
        },
      ));
      request['user'] = response.data.user; // сохрани user для дальнейшего использования
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid token', e);
    }
  }
}
