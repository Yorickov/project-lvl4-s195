module.exports = {
  development: {
    storage: './db.dev.sqlite',
    dialect: 'sqlite',
  },
  test: {
    storage: 'db.testing.sqlite',
    dialect: 'sqlite',
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: { ssl: true },
  },
};
