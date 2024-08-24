// Example of using elysia-session with sessions storedin Sqlite

import {Elysia} from 'elysia'
import {cookie} from '@elysiajs/cookie'
import {sessionPlugin} from './src/index'

let connString = { // replace host, port, database, username, password
  host: 'localhost',
  port: 5432,
  database: 'yalloy',
  user: 'jkelkar',
  password: '3ntr0py'
}

import {BunPGStore} from './src/stores/bun/pgstore'
const store = new BunPGStore(connString, "user_sessions") // name of table in database

const debug = 1
let error
let save = {}

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
