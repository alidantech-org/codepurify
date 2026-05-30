import { defineCodepotConfig, defineVersionContract, property, field, query } from 'codepot';

const v1 = defineVersionContract({
  key: 'demo_api',
  version: 1,
  info: {
    title: 'Demo API',
    version: '1.0.0',
  },
});

const props = v1.defineProperties();

const shared = props.shared({
  id: property.uuid().build(),
  displayName: property.string().minLength(2).maxLength(80).build(),
  email: property.email().build(),
});

const users = props.entity('User', {
  id: field.ref(shared.ref.id, {
    required: true,
    query: query.filter().sort().select().done(),
  }),

  name: field.ref(shared.ref.displayName, {
    required: true,
  }),

  email: field.ref(shared.ref.email, {
    required: true,
  }),
});

export default defineCodepotConfig({
  contracts: [v1],
  output: {
    folder: '.codepot',
    baseName: 'codepot',
    formats: ['json', 'yaml'],
  },
});
