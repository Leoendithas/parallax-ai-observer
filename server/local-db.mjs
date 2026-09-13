import {DatabaseSync} from 'node:sqlite';
import {mkdir,readdir,readFile} from 'node:fs/promises';
export async function localDatabase(filename='.sites-runtime/leaderboard.sqlite'){
 if(filename!==':memory:')await mkdir('.sites-runtime',{recursive:true});
 const db=new DatabaseSync(filename);
 db.exec('CREATE TABLE IF NOT EXISTS __local_migrations(name TEXT PRIMARY KEY)');
 for(const name of (await readdir('drizzle')).filter(n=>n.endsWith('.sql')).sort()){
  if(!db.prepare('SELECT name FROM __local_migrations WHERE name=?').get(name)){db.exec(await readFile('drizzle/'+name,'utf8'));db.prepare('INSERT INTO __local_migrations(name) VALUES(?)').run(name);}
 }
 return {
  prepare(sql){
   return {bind(...args){
    return {
     async first(){return db.prepare(sql).get(...args)||null;},
     async all(){return {results:db.prepare(sql).all(...args)};},
     async run(){db.prepare(sql).run(...args);return {success:true};}
    };
   }};
  },
  close(){db.close();}
 };
}
