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
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    operatorsAliases: false,
  },
  // production: {
  //   username: 'yorickov',
  //   password: null,
  //   database: 'task_manager',
  //   host: 'localhost',
  //   dialect: 'postgres',
  // },
};
