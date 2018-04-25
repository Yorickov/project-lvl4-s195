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
    use_env_variable: process.env.DATABASE_URL,
    dialect: 'postgres',
  },
};
