export default class Env {
  static api = process.env.VUE_APP_API || 'http://localhost:8080/';
}
