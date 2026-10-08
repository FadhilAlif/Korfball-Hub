import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: any;
  };
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((res) => {
        // If handler returned pre-formatted object with data/message
        if (res && typeof res === 'object' && ('data' in res || 'success' in res)) {
          return {
            success: res.success !== undefined ? res.success : true,
            data: res.data !== undefined ? res.data : res,
            message: res.message || 'Operasi berhasil',
            meta: res.meta,
          };
        }
        return {
          success: true,
          data: res,
          message: 'Operasi berhasil',
        };
      }),
    );
  }
}
