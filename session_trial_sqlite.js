// Example of using elysia-session with sessions storedin PostgreSQL

import {Elysia} from 'elysia'
import {cookie} from '@elysiajs/cookie'
import {sessionPlugin} from './src/index'

import {BunSQLiteStore} from './src/stores/bun/sqlite'
import {Database} from 'bun:sqlite'
const database = new Database('order.sqlite')
const store = new BunSQLiteStore(database, "sessions") // name of table in database

let app = new Elysia()
  .use(sessionPlugin({
    cookieName: "session",  // this is the name of what is used as "session"
    expireAfter: 15 * 60,   // session expiry time
    cookieOptions: {
      path: '/',
      sameSite: true,
      maxAge: 15 * 60 // 15 minutes
    },
    store,
  }))
  .use(
    cookie({
      secret: 'Your choice of secret'
    })
  )
  .get('/', ({session}) => {
    console.log('session:', session)
    console.log('/')
    session.sample = {name: 'Jay'}
    console.log('sess:', session)
    return {data: session}
  })
  .get('/test1', ({session}) => {
    console.log('session:', session)
    console.log('/test1')
    session.sample.lname = 'hello'
    return {data: session}
  })
  .get('/test2', ({session}) => {
    console.log('session:', session)
    console.log('/test2')
    console.log('type2:', typeof (session))
    session.sample.age = 58
    return {data: session}
  })
  .get('/test3', ({session}) => {
    console.log('session:', session)
    console.log('/test3')
    console.log('type3:', typeof (session))
    session.person = {a: 'a', b: 'b', c: 'c'}
    return {data: session}
  })
  .listen(3000)

console.log('Bun server is running on port 3000')
