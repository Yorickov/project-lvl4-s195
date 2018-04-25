import faker from 'faker';

export default () => {
  const user = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };

  return (options = {}) => {
    const result = { ...user, ...options };
    return Object.keys(result)
      .filter(item => result[item])
      .reduce((acc, key) => ({ ...acc, [key]: result[key] }), {});
  };
};
