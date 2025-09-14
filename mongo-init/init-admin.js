db.createUser({
  user: 'admin',
  pwd: 'password',
  roles: [
    {
      role: 'readWrite',
      db: 'myblog'
    },
    {
      role: 'dbAdmin',
      db: 'myblog'
    }
  ]
});

db = db.getSiblingDB('admin');

db.createUser({
  user: 'admin',
  pwd: 'password',
  roles: ['userAdminAnyDatabase', 'dbAdminAnyDatabase', 'readWriteAnyDatabase']
});
