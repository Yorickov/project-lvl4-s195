import faker from 'faker';

export default () => {
  const userInit = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };

  const user = { ...userInit, confirmedPassword: userInit.password };

  return (options = {}) => ({ ...user, ...options });
};
