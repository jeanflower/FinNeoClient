import { RESTDB } from './REST_db';


const restdb = new RESTDB();

export function getDB() {
  return restdb;
}
