import {
  codepot,
  ref,
  primitive,
  entity,
  entityField,
  contentType,
  securityScheme,
  securityAuth,
} from '../src/contract/functions/builders';
import { UrlEnv } from '../src/contract/types/url/definition';
import { PrimitiveType, PrimitiveFormat } from '../src/contract/types/properties/primitive/definition';
import { FieldPersistenceMode, FieldAccessLevel } from '../src/contract/types/schema/entity/field/definition';
import { SecuritySchemeType } from '../src/contract/types/security/definition';
import { ContentTypeStrategy } from '../src/contract/types/transport/definition';
import { writeFileSync } from 'fs';

const api = codepot()
  .codepot('1.0.0')
  .key('my_api')
  .version(1)
  .info((i) => i.title('My API').version('1.0.0').contact({ name: 'Team', email: 'team@example.com' }))
  .url((u) => u.env(UrlEnv.production).uri('https://api.example.com'))
  .url((u) => u.env(UrlEnv.local).uri('http://localhost:3000'))
  .properties((p) =>
    p
      .primitive('Uuid', primitive().type(PrimitiveType.string).format(PrimitiveFormat.uuid).build())
      .primitive('String', primitive().type(PrimitiveType.string).build())
      .primitive('Email', primitive().type(PrimitiveType.string).format(PrimitiveFormat.email).build()),
  )
  .schemas((s) =>
    s
      .entity(
        'User',
        entity()
          .field(
            'id',
            entityField()
              .ref(ref('properties.primitives.Uuid'))
              .required()
              .persistence((fp) => fp.mode(FieldPersistenceMode.stored).generated())
              .access((fa) => fa.read(FieldAccessLevel.public))
              .build(),
          )
          .build(),
      )
      .params('UuidParam', { ref: ref('properties.primitives.Uuid'), required: true }),
  )
  .transport((t) =>
    t
      .contentType('json', contentType().value('application/json').strategy(ContentTypeStrategy.json).build())
      .response('user', { status: 200, schema: ref('schemas.entities.User'), contentType: ref('transport.contentTypes.json') })
      .response('userList', { status: 200, schema: ref('schemas.entities.User'), contentType: ref('transport.contentTypes.json') }),
  )
  .security((sec) =>
    sec.scheme('bearer', securityScheme().type(SecuritySchemeType.http).scheme('bearer').bearerFormat('JWT').build()).auth(
      'bearer',
      securityAuth()
        .mode('required' as any)
        .scheme(ref('security.schemes.bearer'))
        .build(),
    ),
  )
  .resource('users', (r) =>
    r
      .folders('auth', 'users')
      .defaults((s) => s.protected())
      .route('/users', (p) =>
        p
          .get((m) => m.operation(ref('operations.users.list')).response(200, ref('transport.responses.userList')))
          .post((m) =>
            m
              .operation(ref('operations.users.create'))
              .body({ schema: ref('schemas.entities.User'), contentType: ref('transport.contentTypes.json') })
              .response(201, ref('transport.responses.user')),
          ),
      )
      .route('/users/:id', (p) =>
        p
          .param('id', ref('schemas.params.UuidParam'))
          .get((m) => m.operation(ref('operations.users.get')).response(200, ref('transport.responses.user')))
          .patch((m) =>
            m
              .operation(ref('operations.users.patch'))
              .security((s) => s.auth(ref('security.auth.bearer')))
              .response(200, ref('transport.responses.user')),
          ),
      ),
  )
  .buildResolved();

writeFileSync('api-config.json', JSON.stringify(api, null, 2));
console.log('Saved to api-config.json');
