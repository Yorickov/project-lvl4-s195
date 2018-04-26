module.exports = {
  development: {
    storage: './db.dev.sqlite',
    dialect: 'sqlite',
    operatorsAliases: false,
  },
  test: {
    storage: 'db.testing.sqlite',
    dialect: 'sqlite',
    operatorsAliases: false,
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: { ssl: true },
    operatorsAliases: false,
  },
};
