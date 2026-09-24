import { test } from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { updateUser, deleteUser, login } from "../src/lib/localStore.js";

if (!globalThis.crypto) globalThis.crypto = webcrypto;
const rows = { users: new Map(), folders: new Map() };
// Minimal persistence stub: the tests exercise user policy and credentials, not IndexedDB.
globalThis.indexedDB = {
  open() {
    const req = {};
    queueMicrotask(() => {
      req.result = {
        transaction() {
          const tx = {
            objectStore(name) {
              return {
                getAll() {
                  const request = {};
                  queueMicrotask(() => {
                    request.result = [...rows[name].values()];
                    request.onsuccess();
                  });
                  return request;
                },
                put(record) {
                  rows[name].set(record.id, record);
                },
                delete(id) {
                  rows[name].delete(id);
                },
              };
            },
          };
          setTimeout(() => tx.oncomplete?.(), 0);
          return tx;
        },
      };
      req.onsuccess();
    });
    return req;
  },
};

test("user management, login, own profile and folder preservation", async () => {
  const admin = {
    id: "admin",
    name: "Admin",
    email: "admin@example.test",
    role: "admin",
  };
  rows.users.set(admin.id, admin);
  const data = {
    name: "Profissional",
    email: "user@example.test",
    role: "user",
    specialty: "",
    password: "Test-password-123",
  };
  await updateUser(admin, "user", data);
  const user = rows.users.get("user");
  assert.equal(await login(data.email, data.password), "user");
  await assert.rejects(login(data.email, "wrong-password"), /inválidos/);
  await updateUser(user, user.id, {
    ...data,
    role: "admin",
    name: "Nome atualizado",
    password: "",
  });
  assert.equal(rows.users.get("user").role, "user");
  assert.equal(rows.users.get("user").name, "Nome atualizado");
  await assert.rejects(updateUser(user, admin.id, data), /permitido/);
  await assert.rejects(updateUser(admin, "other", data), /cadastrado/);
  await assert.rejects(
    updateUser(admin, admin.id, { ...data, email: admin.email }),
    /administrador/,
  );
  await assert.rejects(deleteUser(admin, admin.id), /conta em uso/);
  await assert.rejects(deleteUser(user, admin.id), /permitido/);
  rows.folders.set("folder", {
    id: "folder",
    owner: "user",
    members: ["user"],
    count: 2,
  });
  await deleteUser(admin, "user");
  assert.equal(rows.users.has("user"), false);
  assert.deepEqual(rows.folders.get("folder"), {
    id: "folder",
    owner: "admin",
    members: [],
    count: 2,
  });
});
