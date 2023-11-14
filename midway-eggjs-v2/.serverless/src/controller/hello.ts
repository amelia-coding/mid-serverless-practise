import {
  Provide,
  Inject,
  ServerlessTrigger,
  ServerlessTriggerType,
  Query,
  Controller,
} from '@midwayjs/decorator';
import { Context } from '@midwayjs/faas';

@Provide()
@Controller('/hello')
export class HelloController {
  @Inject()
  ctx: Context;

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: '/hello',
    method: 'get',
  })
  async handleHTTPEvent(@Query() name = 'midwayjs') {
    return `Hello ${name}`;
  }
}
