export default class UserExists extends Error {
  constructor() {
    super("User already exists");
  }
}