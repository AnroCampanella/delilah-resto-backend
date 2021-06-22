const express = require("express");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const Usuarios = require("./usuarios.js");
const Pedidos = require("./pedidos.js");
const Productos = require("./productos.js");

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Delilah Resto",
      version: "1.0.0",
      description: "API para conectarse al Delilah Resto",
    },
  },
  apis: ["./index.js"],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);

const server = express();
const PORT = 3000;

server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
server.use(express.json());

let listaPedidos = [];
let listaUsuarios = [];
let listaProductos = [];

// creo el usuario Admin
listaUsuarios.push(
  new Usuarios(
    "admin",
    "",
    "admin@dominio.com",
    "",
    "",
    "admin",
    "lamegaclave",
    true
  )
);

// middleware local para verificar si el usuario es administrador
const esAdmin = (req, res, next) => {
  let usuarioAdmin = listaUsuarios[req.headers.token].esAdmin; //verifcaSiElUsuarioesAdmin(req.headers.username);

  if (usuarioAdmin) {
    next();
  } else {
    res.status(403).send("No es Administrador");
  }
};

// middleware local para verificar si el usuario está conectado
const esLogin = (req, res, next) => {
  let estaLogin = listaUsuarios[req.headers.token].estaLogin; // verificarLogin(req.headers.token);

  if (estaLogin) {
    next();
  } else {
    res.status(401).send("No esta logueado");
  }
};

/*
 * Endpoints de usuarios
 */

/**
 * @swagger
 * /usuarios:
 *  get:
 *    summary: "Retorna todos los usuarios"
 *    description: Retorna un array de objetos con los usuarios del sistema
 *    parameters: []
 *    produces:
 *      - "application/json"
 *    responses:
 *      "200":
 *        description: "successful operation"
 *        schema:
 *          type: "string"
 *          example: [{ "nombre": string, "apellido": string, "email": string, "direccion": string, "telefono": string, "username": string }]
 */
server.get("/usuarios", esLogin, esAdmin, (req, res) => {
  let users = readUsuarios();
  res.status(200).json(users);
});

/**
 * @swagger
 * /usuarios/:username:
 *  get:
 *    summary: "Retorna el usuario pedido"
 *    description: Retorna los datos del usuario pedido
 *    consumes:
 *      - "application/json"
 *    parameters:
 *    - name: "username"
 *      in: "path"
 *      description: "Username a retornar"
 *      required: true
 *      type: "string"
 *    produces:
 *      - "application/json"
 *    responses:
 *      "200":
 *        description: "successful operation"
 *        schema:
 *          type: "string"
 *          example: { "nombre": string, "apellido": string, "email": string, "direccion": string, "telefono": string, "username": string }
 */

server.get("/usuarios/:usuarioId", esLogin, (req, res) => {
  let quienPide = parseInt(req.headers.token);
  let usuarioId = req.params.usuarioId;

  if (quienPide === 0) {
    // es el admin que pide datos de otro usuario
    let indice = existeUsuario(usuarioId);
    if (indice > 0) {
      res.status(200).json(listaUsuarios[indice].getDatos());
    } else {
      res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
  } else {
    if (listaUsuarios[quienPide].username === usuarioId) {
      // es el mismo usuario que esta logueado que pide sus datos
      res.status(200).json(listaUsuarios[quienPide].getDatos());
    } else {
      res.status(403).send("No es Administrador");
    }
  }
});

/**
 * @swagger
 * /usuarios:
 *  post:
 *    summary: "Crear un usuario"
 *    description: Crea un usuario en el sistema, valida que el username o email no esté duplicado
 *    consumes:
 *      - "application/json"
 *    parameters:
 *    - name: body
 *      description: Objeto cuerpo de un usuario
 *      in: body
 *      required: true
 *      type: "string"
 *      example: { "nombre": string, "apellido": string, "email": string, "direccion": string, "telefono": string, "username": string, "clave": string}
 *    produces:
 *      - "application/json"
 *    responses:
 *      "201":
 *        description: "Usuario creado"
 *      "403":
 *        description: "Usuario duplicado"
 */
server.post("/usuarios", (req, res) => {
  // no es necesario validar el reingreso de clave
  // la pantalla de singup "page-1-sign-up.png" no lo tenía
  let success = createUsuarios(req.body);

  if (success) {
    res.status(201).json({ mensaje: "Usuario creado" });
  } else {
    res.status(403).json({ mensaje: "Usuario duplicado" });
  }
});

/**
 * @swagger
 * /login:
 *  post:
 *    summary: "Hacer login de un usuario"
 *    description: Loguea un usuario al sistema, valida que el usuario exista y la clave sea correcta
 *    consumes:
 *      - "application/json"
 *    parameters:
 *    - name: body
 *      description: Objeto cuerpo con datos de login
 *      in: body
 *      required: true
 *      type: "string"
 *      example: { "username": string, "clave": string }
 *    produces:
 *      - "application/json"
 *    responses:
 *      "200":
 *        description: "Login correcto"
 *      "401":
 *        description: "Usuario o clave incorrecta"
 */
server.post("/login", (req, res) => {
  let indice = loginUsuario(req.body.username, req.body.clave);

  if (indice >= 0) {
    res.status(200).json({ codigo: indice, mensaje: "Login correcto" });
  } else {
    res.status(401).json({ mensaje: "Usuario o Clave incorrecta" });
  }
});

/**
 * @swagger
 * /usuarios/:username:
 *  put:
 *    summary: "Actualizar un usuario"
 *    description: Crea un usuario en el sistema, valida que el username o email no esté duplicado
 *    consumes:
 *      - "application/json"
 *    parameters:
 *    - name: "username"
 *      in: "path"
 *      description: "Username a actualizar"
 *      required: true
 *      type: "string"
 *    - name: body
 *      description: Objeto cuerpo de un usuario
 *      in: body
 *      required: true
 *      example: { "nombre": string, "apellido": string, "email": string, "direccion": string, "telefono": string, "username": string, "clave": string}
 *    produces:
 *      - "application/json"
 *    responses:
 *      "200":
 *        description: "Usuario actualizado"
 *      "404":
 *        description: "Usuario no encontrado"
 */
server.put("/usuarios/:usuarioId", esLogin, (req, res) => {
  let success = updateUsuarios(req.params.usuarioId, req.body);

  if (success) {
    res.status(200).json({ mensaje: "Usuario actualizado" });
  } else {
    res.status(404).json({ mensaje: "Usuario no encontrado" });
  }
});

/**
 * @swagger
 * /usuarios/:username:
 *  delete:
 *    summary: "Eliminar un usuario"
 *    description: Eliminar un usuario en el sistema
 *    consumes:
 *      - "application/json"
 *    parameters:
 *    - name: "username"
 *      in: "path"
 *      description: "Username a eliminar"
 *      required: true
 *      type: "string"
 *    produces:
 *      - "application/json"
 *    responses:
 *      "200":
 *        description: "Usuario eliminado"
 *      "404":
 *        description: "Usuario no encontrado"
 */
server.delete("/usuarios/:usuarioId", esLogin, esAdmin, (req, res) => {
  let success = deleteUsuarios(req.params.usuarioId);
  if (success) {
    res.status(200).json({ mensaje: "Usuario eliminado" });
  } else {
    res.status(404).json({ mensaje: "Usuario no encontrado" });
  }
});

/*
 * Endpoints de productos
 */

/**
 * @swagger
 * /productos:
 *  get:
 *    summary: "Retorna todos los productos"
 *    description: Retorna un array de objetos con los productos del sistema
 *    parameters: []
 *    produces:
 *      - "application/json"
 *    responses:
 *      "200":
 *        description: "successful operation"
 *        schema:
 *          type: "string"
 *          example: [{ "nombre": string, "precio": string, "fotoUrl": string }]
 */
server.get("/productos", esLogin, (req, res) => {
  let allProductos = readProductos();
  res.json(allProductos);
});

/**
 * @swagger
 * /productos:
 *  post:
 *    summary: "Crear un nuevo producto"
 *    description: Crea un producto en el sistema,no valida que el producto este repetido
 *    consumes:
 *      - "application/json"
 *    parameters:
 *    - name: body
 *      description: Objeto cuerpo de un producto
 *      in: body
 *      required: true
 *      type: "string"
 *      example: {"nombre": string, "precio": string, "fotoUrl": string}
 *    produces:
 *      - "application/json"
 *    responses:
 *      "201":
 *        description: "Producto creado"
 */
server.post("/productos", esLogin, esAdmin, (req, res) => {
  createProductos(req.body);
  res.status(201).json({ mensaje: "Producto creado" });
});

/**
 * @swagger
 * /productos/:indice:
 *  put:
 *    summary: "Modifica un producto"
 *    description: Modifica un producto en el sistema, valida que el username o email no esté duplicado
 *    consumes:
 *      - "application/json"
 *    parameters:
 *    - name: "indice"
 *      in: "path"
 *      description: "indice del producto a actualizar"
 *      required: true
 *      type: "string"
 *    - name: body
 *      description: Objeto cuerpo de un producto
 *      in: body
 *      required: true
 *      type: "string"
 *      example: { "nombre": string, "precio": string, "fotoUrl": string }
 *    produces:
 *      - "application/json"
 *    responses:
 *      "200":
 *        description: "Producto modificado"
 *      "404":
 *        description: "Producto no encontrado"
 */
server.put("/productos/:indice", esLogin, esAdmin, (req, res) => {
  let success = updateProductos(req.params.indice, req.body);

  if (success) {
    res.status(200).json({ mensaje: "Producto actualizado" });
  } else {
    res.status(404).json({ mensaje: "Producto no encontrado" });
  }
});

/**
 * @swagger
 * /productos/:indice:
 *  delete:
 *    summary: "Elimina un producto"
 *    description: Elimina un producto en el sistema
 *    consumes:
 *      - "application/json"
 *    parameters:
 *    - name: "indice"
 *      in: "path"
 *      description: "indice del producto a eliminar"
 *      required: true
 *      type: "string"
 *    - name: body
 *      description: Objeto cuerpo de un producto
 *      in: body
 *      required: true
 *      type: "string"
 *      example: { "nombre": string, "precio": string, "fotoUrl": string }
 *    produces:
 *      - "application/json"
 *    responses:
 *      "200":
 *        description: "Producto eliminado"
 *      "404":
 *        description: "Producto no encontrado"
 */
server.delete("/productos/:indice", esLogin, esAdmin, (req, res) => {
  let success = deleteProductos(req.params.indice);
  if (success) {
    res.status(200).json({ mensaje: "Producto eliminado" });
  } else {
    res.status(404).json({ mensaje: "Producto no encontrado" });
  }
});

/*
 * Endpoints de pedidos
 */

/**
 * @swagger
 * /pedidos:
 *  get:
 *    summary: "Retorna todos los pedidos"
 *    description: Retorna un array de objetos con los pedidos del sistema
 *    parameters: []
 *    produces:
 *    - "application/json"
 *    responses:
 *      "200":
 *        description: "successful operation"
 *        schema:
 *          type: "string"
 *          example: { "formaPago": string, "estado": string, "productos": string,"precioTotal": string }
 */
server.get("/pedidos", esLogin, (req, res) => {
  let allPedidos = readPedidos();
  res.json(allPedidos);
});

/**
 * @swagger
 * /pedidos:
 *  post:
 *    summary: "Crear un nuevo pedido"
 *    description: Crea un pedido en el sistema
 *    consumes:
 *    - "application/json"
 *    parameters:
 *    - name: body
 *      description: Objeto cuerpo de un pedido
 *      in: body
 *      required: true
 *      type: "string"
 *      example: { "formaPago": string, "productos": string, "precioTotal": string }
 *    produces:
 *      - "application/json"
 *    responses:
 *      "201":
 *        description: "Pedido creado"
 */
server.post("/pedidos", esLogin, (req, res) => {
  createPedidos(req.body);
  res.status(201).json({ mensaje: "Pedido creado" });
});

/**
 * @swagger
 * /pedidos/:indice:
 *  put:
 *    summary: "Modificar un pedido"
 *    description: Modifica un pedido en el sistema, valida que el indice exista en el sistema
 *    consumes:
 *      - "application/json"
 *    parameters:
 *    - name: "indice"
 *      in: "path"
 *      description: "indice del pedido a actualizar"
 *      required: true
 *      type: "string"
 *    - name: body
 *      description: Objeto cuerpo de un pedido
 *      in: body
 *      required: true
 *      type: "string"
 *      example: { "formaPago": string, "estado": string, "productos": string,"precioTotal": string }
 *    produces:
 *      - "application/json"
 *    responses:
 *      "200":
 *        description: "Pedido actualizado"
 *      "404":
 *        description: "Pedido no encontrado"
 */
server.put("/pedidos/:indice", esLogin, (req, res) => {
  //personas[parseInt(req.params.indice)] = req.body;
  let success = updatePedidos(req.params.indice, req.body);
  if (success) {
    res.status(200).json({ mensaje: "Pedido actualizado" });
  } else {
    res.status(404).json({ mensaje: "Pedido no encontrado" });
  }
});

/**
 * @swagger
 * /pedidos/:indice:
 *  delete:
 *    summary: "Elimina un pedido"
 *    description: Elimina un pedido en el sistema
 *    consumes:
 *      - "application/json"
 *    parameters:
 *    - name: "indice"
 *      in: "path"
 *      description: "indice del pedido a eliminar"
 *      required: true
 *      type: "string"
 *    - name: body
 *      description: Objeto cuerpo de un pedido
 *      in: body
 *      required: true
 *      type: "string"
 *      example: { "nombre": string, "precio": string, "fotoUrl": string }
 *    produces:
 *      - "application/json"
 *    responses:
 *      "200":
 *        description: "Pedido eliminado"
 *      "404":
 *        description: "Pedido no encontrado"
 */
server.delete("/pedidos/:indice", esLogin, (req, res) => {
  let success = deletePedidos(req.params.indice);
  if (success) {
    res.status(200).json({ mensaje: "Pedido eliminado" });
  } else {
    res.status(404).json({ mensaje: "Pedido no encontrado" });
  }
});

server.listen(PORT, () => {
  console.log(`Servidor backend Delilah en ejecución... ${PORT}`);
});

/*
 * funciones
 */

/*
 * CRUD Usuarios
 */

const createUsuarios = (objUsuario) => {
  let indice = existeUsuario(objUsuario.username, objUsuario.email);

  if (indice < 0) {
    listaUsuarios.push(
      new Usuarios(
        objUsuario.nombre,
        objUsuario.apellido,
        objUsuario.email,
        objUsuario.direccion,
        objUsuario.telefono,
        objUsuario.username,
        objUsuario.clave,
        false
      )
    );
    return true;
  } else {
    return false;
  }
};

const readUsuarios = () => {
  let otrosUsuarios = listaUsuarios.map((usuario) => {
    return usuario.getDatos();
  });
  return otrosUsuarios;
};

const updateUsuarios = (username, objUsuario) => {
  let indice = existeUsuario(username, objUsuario.email);

  if (indice >= 0) {
    let nuevoUsuario = new Usuarios(
      objUsuario.nombre,
      objUsuario.apellido,
      objUsuario.email,
      objUsuario.direccion,
      objUsuario.telefono,
      username,
      objUsuario.clave,
      listaUsuarios[indice].esAdmin
    );
    listaUsuarios[indice] = nuevoUsuario;
    return true;
  } else {
    return false;
  }
};

const deleteUsuarios = (username) => {
  let indice = listaUsuarios.findIndex((element, index) => {
    return element.username === username;
  });
  if (indice >= 0) {
    listaUsuarios.splice(indice, 1);
    return true;
  } else {
    return false;
  }
};

/*
 * CRUD Productos
 */

const createProductos = (objProducto) => {
  listaProductos.push(
    new Productos(objProducto.nombre, objProducto.precio, objProducto.fotoUrl)
  );
  return true;
};

const readProductos = () => {
  return listaProductos;
};

const updateProductos = (index, objProducto) => {
  if (index >= 0 && index < listaProductos.length) {
    let nuevoProducto = new Productos(
      objProducto.nombre,
      objProducto.precio,
      objProducto.fotoUrl
    );
    listaProductos[index] = nuevoProducto;
    return true;
  } else {
    return false;
  }
};

const deleteProductos = (index) => {
  if (index >= 0) {
    listaProductos.splice(index, 1);
    return true;
  } else {
    return false;
  }
};

/*
 * CRUD Pedidos
 */

const createPedidos = (objPedido) => {
  listaPedidos.push(
    new Pedidos(
      objPedido.formaPago,
      "nuevo",
      objPedido.productos,
      objPedido.precioTotal,
      new Date(),
      objPedido.username
    )
  );
  return true;
};

const readPedidos = () => {
  return listaPedidos;
};

const updatePedidos = (index, objPedido) => {
  if (index >= 0 && index < listaPedidos.length) {
    let nuevoPedido = new Pedidos(
      objPedido.formaPago,
      objPedido.estado,
      objPedido.productos,
      objPedido.precioTotal,
      listaPedidos[index].fecha,
      listaPedidos[index].username
    );
    listaPedidos[index] = nuevoPedido;
    return true;
  } else {
    return false;
  }
};

const deletePedidos = (index) => {
  if (index >= 0 && index < listaPedidos.length) {
    listaPedidos.splice(index, 1);
    return true;
  } else {
    return false;
  }
};

/*
 *
 * Funciones extras
 *
 */

const existeUsuario = (usernameIn, emailIn = "") => {
  let indice = listaUsuarios.findIndex((element, index) => {
    return element.username === usernameIn || element.email === emailIn;
  });

  return indice;
};

// loguear un usuario
const loginUsuario = (username, clave) => {
  let indice = existeUsuario(username, username);

  if (indice >= 0 && indice < listaUsuarios.length) {
    if (listaUsuarios[indice].clave === clave) {
      listaUsuarios[indice].setLogin();
      return indice;
    } else {
      return -1;
    }
  } else {
    return -1;
  }
};
