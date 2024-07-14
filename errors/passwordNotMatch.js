export default class PasswordNotMatch extends Error {
  constructor() {
    super("Passwords do not match");
  }
}