import supertest from 'supertest';
import { web } from '../src/application/web';
import { logger } from '../src/application/logging';
import { createTestUser, getTestUser, removeTestUser } from './test-util';
import bcrypt from 'bcrypt';

describe('register username', () => {

   afterEach(async () => {
      await removeTestUser()
   })

   it('should trigger new user', async () => {
      const result = await supertest(web)
                     .post('/api/users')
                     .send({
                        username: 'test',
                        password: 'rahasia',
                        name: 'test'
                     })
      expect(result.status).toBe(200);
      expect(result.body.data.username).toBe("test");
      expect(result.body.data.password).toBeUndefined();
      expect(result.body.data.name).toBe("test");
   });

   it("should be reject when invalid request", async () => {
      const result = await supertest(web).post("/api/users")
                     .send({
                        username: "",
                        password: "",
                        name: ""
                     })
      
      logger.info(result.body)
      expect(result.status).toBe(400);
      expect(result.body.errors).toContain("not allowed");
   }) 

    it('should trigger new user', async () => {
      let result = await supertest(web)
                     .post('/api/users')
                     .send({
                        username: 'test',
                        password: 'rahasia',
                        name: 'test'
                     })
      expect(result.status).toBe(200);
      expect(result.body.data.username).toBe("test");
      expect(result.body.data.password).toBeUndefined();
      expect(result.body.data.name).toBe("test");

      result = await supertest(web)
                     .post('/api/users')
                     .send({
                        username: 'test',
                        password: 'rahasia',
                        name: 'test'
                     })
      
      logger.info(result.body)
      expect(result.status).toBe(400);
      expect(result.status.errors).toBeUndefined()
                     
   });
});

describe('post api/users/login', () => {
   beforeEach(async () => {
     await createTestUser();
   })

   afterEach(async () => {
      await removeTestUser();
   })

   it('should login', async () => {
      const result = await supertest(web).post('/api/users/login').send({
         username: "test",
         password: "rahasia"
      })

      expect(result.status).toBe(200);
      expect(result.body.data.token).toBeDefined();
      expect(result.body.data.token).not.toBe('token');
   });

   it('should errors causes invalid request', async () => {
      const result = await supertest(web).post("/api/users/login").send({
         username: "",
         password: ""
      })

      expect(result.status).toBe(400);
      expect(result.body.errors).toBeDefined();
   });

   it('should errors causes wrong password', async () => {
      const result = await supertest(web).post('/api/users/login').send({
         username: "test",
         password: "salah"
      })

      expect(result.status).toBe(401);
      expect(result.body.errors).toBeDefined();
   });

   it('should errors causes wrong password and username', async () => {
      const result = await supertest(web).post('/api/users/login').send({
         username: "salah",
         password: "salah"
      })

      expect(result.status).toBe(401);
      expect(result.body.errors).toBeDefined();
   });
});

describe('get api/users/current', () => {
   beforeEach(async () => {
      await createTestUser();
   })

   afterEach(async () => {
      await removeTestUser();
   })

   it("should get data user", async () => {
      const result = await supertest(web).get("/api/users/current").set({
         'authorization': "test"
      })

      expect(result.status).toBe(200);
      expect(result.body.data.username).toBe("test");
      expect(result.body.data.name).toBe("test");
   })

   it("should fail get data user causes unauthorized", async () => {
      const result = await supertest(web).get("/api/users/current").set({
         authorization: "salah"
      })

      expect(result.status).toBe(401);
      expect(result.body.errors).toBeDefined();
   })
});

describe('petch api/users/current', () => {
   beforeEach(async () => {
      await createTestUser();
   });

   afterEach(async () => {
      await removeTestUser();
   });

   it('should update data users', async () => {
      const result = await supertest(web)
                     .patch("/api/users/current")
                     .set({authorization: "test"})
                     .send({
                        name: "zidane",
                        password: "rahasia lagi"
                     });
      expect(result.status).toBe(200);
      expect(result.body.data.name).toBe("zidane");
      expect(result.body.data.username).toBe("test");

      const user = await getTestUser();
      expect(await bcrypt.compare("rahasia lagi", user.password)).toBe(true)
   });

   it('should update name users', async () => {
      const result = await supertest(web)
                     .patch("/api/users/current")
                     .set({authorization: "test"})
                     .send({
                        name: "zidane",
                        password: "rahasia lagi"
                     });
      expect(result.status).toBe(200);
      expect(result.body.data.name).toBe("zidane");
      expect(result.body.data.username).toBe("test");
   });

   it('should update password users', async () => {
      const result = await supertest(web)
                     .patch("/api/users/current")
                     .set({authorization: "test"})
                     .send({
                        password: "rahasia lagi"
                     });
      expect(result.status).toBe(200);
      expect(result.body.data.username).toBe("test");

      const user = await getTestUser();
      expect(await bcrypt.compare("rahasia lagi", user.password)).toBe(true);
   });

   it('should rejected causes invalid request', async () => {
      const result = await supertest(web).patch("/api/users/current").send({
         name: "",
         password: ""
      })

      expect(result.status).toBe(401);
      expect(result.body.errors).toBeDefined();
   });
});

describe('delete api/users/current', () => {
   beforeEach(async () => {
      await createTestUser()
   });

   afterEach(async () => {
      await removeTestUser()
   })

   it('should logout users', async () => {
      const result = await supertest(web)
                     .delete("/api/users/logout")
                     .set({authorization: "test"});

      expect(result.status).toBe(200);
      expect(result.body.data).toBe("ok");

      const user = await getTestUser();
      expect(user.token).toBeNull();
   });

   it('should invalid logout users causes wrong token', async () => {
      const result = await supertest(web)
                     .delete("/api/users/logout")
                     .set({authorization: "wrong"});

      expect(result.status).toBe(401);
   });
});