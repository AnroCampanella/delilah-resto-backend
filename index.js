const express = require("express");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const Usuarios = require("./clases/usuarios");
const Pedidos = require("./clases/pedidos");
const Productos = require("./clases/productos");
const MedioDePago = require("./clases/medioDePago");
const { HTTP_STATUS, SERVER_PORT, PEDIDOS_STATUS } = require("./constants");

const {
  esLogin,
  esAdmin,
  validoIdProducto,
  validoIdPedido,
  validoIdMedioPago,
} = require("./middleware");

const {
  listaMedioDePagos,
  listaPedidos,
  listaProductos,
  listaUsuarios,
} = require("./structures");

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

server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
server.use(express.json());

// creo el usuario Admin
listaUsuarios.push(
  new Usuarios("admin", "admin@dominio.com", "", "", "admin", "lamegaclave", true)
);

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
 *          example: [{ "nombreApellido": string, "email": string, "direccion": string, "telefono": string, "username": string }]
 */
server.get("/usuarios", esLogin, esAdmin, (req, res) => {
  let usuarios = listaUsuarios.map((usuario) => {
    return usuario.getDatos();
  });
  res.status(HTTP_STATUS.Ok).json(usuarios);
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
 *      example: { "nombreApellido": string, "email": string, "direccion": string, "telefono": string, "username": string, "clave": string}
 *    produces:
 *      - "application/json"
 *    responses:
 *      "201":
 *        description: "Usuario creado"
 *      "403":
 *        description: "Usuario duplicado"
 */
server.post("/usuarios", (req, res) => {
  let { nombreApellido, email, direccion, telefono, username, clave } = req.body;

  let codigo = listaUsuarios.findIndex((element, index) => {
    return element.username === username || element.email === email;
  });

  if (codigo < 0) {
    listaUsuarios.push(
      new Usuarios(nombreApellido, email, direccion, telefono, username, clave, false)
    );
    res.status(HTTP_STATUS.Created).json({ mensaje: "Usuario creado" });
  } else {
    res.status(HTTP_STATUS.Forbidden).json({ mensaje: "Usuario duplicado" });
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
  let { username, clave } = req.body;

  // tenemos un solo campo en el form (inputUsername) para ambos datos (email/username)
  // puede ser un username o email el elemento username del POST
  let codigo = listaUsuarios.findIndex((element, index) => {
    return element.username === username || element.email === username;
  });

  if (listaUsuarios[codigo] && listaUsuarios[codigo].clave === clave) {
    listaUsuarios[codigo].setLogin();
    res.status(HTTP_STATUS.Ok).json({ codigo: codigo, mensaje: "Login correcto" });
  } else {
    res.status(HTTP_STATUS.Unauthorized).json({ mensaje: "Usuario o Clave incorrecta" });
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
  let lista = listaProductos.map((element, index) => {
    return {
      codigo: index,
      nombre: element.nombre,
      precio: element.precio,
      fotoUrl: element.fotoUrl,
    };
  });
  res.status(HTTP_STATUS.Ok).json(lista);
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
  let { nombre, precio, fotoUrl } = req.body;
  codigoCreado = listaProductos.push(new Productos(nombre, precio, fotoUrl));

  res
    .status(HTTP_STATUS.Created)
    .json({ codigo: codigoCreado - 1, mensaje: "Producto creado" });
});

/**
 * @swagger
 * /productos/:codigo:
 *  put:
 *    summary: "Modifica un producto"
 *    description: Modifica un producto en el sistema, valida que el username o email no esté duplicado
 *    consumes:
 *      - "application/json"
 *    parameters:
 *    - name: "codigo"
 *      in: "path"
 *      description: "codigo del producto a actualizar"
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
server.put("/productos/:codigo", esLogin, esAdmin, validoIdProducto, (req, res) => {
  let { codigo } = req.params;
  let { nombre, precio, fotoUrl } = req.body;

  let nuevoProducto = new Productos(nombre, precio, fotoUrl);
  listaProductos[codigo] = nuevoProducto;

  res.status(HTTP_STATUS.Ok).json({ mensaje: "Producto actualizado" });
});

/**
 * @swagger
 * /productos/:codigo:
 *  delete:
 *    summary: "Elimina un producto"
 *    description: Elimina un producto en el sistema
 *    consumes:
 *      - "application/json"
 *    parameters:
 *    - name: "codigo"
 *      in: "path"
 *      description: "codigo del producto a eliminar"
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
server.delete("/productos/:codigo", esLogin, esAdmin, validoIdProducto, (req, res) => {
  let { codigo } = req.params;
  listaProductos.splice(codigo, 1);

  res.status(HTTP_STATUS.Ok).json({ mensaje: "Producto eliminado" });
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
 *          example: { "formaPago": string, "estado": string, "productos": string,"direccion": string,"fecha": datetime,"username": string }
 */
server.get("/pedidos", esLogin, (req, res) => {
  let { tokenDeLogin } = req.headers; // quien está pidiendo

  if (listaUsuarios[tokenDeLogin].esAdmin) {
    // es el admin que pide datos de un pedido cualquiera
    res.status(HTTP_STATUS.Ok).json(listaPedidos);
  } else {
    let misPedidos = listaPedidos.filter((element, index) => {
      return element.username === listaUsuarios[tokenDeLogin].username;
    });
    res.status(HTTP_STATUS.Ok).json(misPedidos);
  }
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
 *      example: { "formaPago": string, "productos": string, "direccion": string }
 *    produces:
 *      - "application/json"
 *    responses:
 *      "201":
 *        description: "Pedido creado"
 */
server.post("/pedidos", esLogin, (req, res) => {
  let { tokenDeLogin } = req.headers; // quien está pidiendo
  let { formaPago, productos, direccion } = req.body;

  //TODO validar que forma Pago exista y que Productos existan
  if (!direccion) {
    direccion = listaUsuarios[tokenDeLogin].direccion;
  }

  let codigoCreado = listaPedidos.push(
    new Pedidos(
      formaPago,
      productos,
      direccion,
      new Date(),
      listaUsuarios[tokenDeLogin].username
    )
  );

  res.status(HTTP_STATUS.Created).json({ codigo: codigoCreado - 1, mensaje: "Pedido creado" });
});

// TODO CAMBIAR ESTADO => FALTA SWAGGER
server.post("/pedidos/:codigo/:estado", esLogin, esAdmin, validoIdPedido, (req, res) => {
  let { codigo } = req.params; // codigo del pedido
  let { estado } = req.params; // proximo estado del pedido

  success = listaPedidos[codigo].setEstado(estado);

  if (success) {
    res.status(HTTP_STATUS.Ok).json({ mensaje: "Pedido actualizado" });
  } else {
    res.status(HTTP_STATUS.BadRequest).json({ mensaje: "Estado incorrecto" });
  }
});

/**
 * @swagger
 * /pedidos/:codigo:
 *  put:
 *    summary: "Modificar un pedido"
 *    description: Modifica un pedido en el sistema, valida que el codigo exista en el sistema
 *    consumes:
 *      - "application/json"
 *    parameters:
 *    - name: "codigo"
 *      in: "path"
 *      description: "codigo del pedido a actualizar"
 *      required: true
 *      type: "string"
 *    - name: body
 *      description: Objeto cuerpo de un pedido
 *      in: body
 *      required: true
 *      type: "string"
 *      example:  { "formaPago": string, "productos": string, "direccion": string }
 *    produces:
 *      - "application/json"
 *    responses:
 *      "200":
 *        description: "Pedido actualizado"
 *      "404":
 *        description: "Pedido no encontrado"
 */
server.put("/pedidos/:codigo", esLogin, validoIdPedido, (req, res) => {
  let { tokenDeLogin } = req.headers; // quien está pidiendo
  let { codigo } = req.params; // codigo del pedido
  let { formaPago, productos, direccion } = req.body;

  if (listaPedidos[codigo].estado !== PEDIDOS_STATUS.Pendiente) {
    res
      .status(HTTP_STATUS.Forbidden)
      .json({ mensaje: "Petición denegada, pedido no está pendiente" });
  } else {
    if (!direccion) {
      direccion = listaUsuarios[tokenDeLogin].direccion;
    }

    if (listaUsuarios[tokenDeLogin].username === listaPedidos[codigo].username) {
      let nuevoPedido = new Pedidos(
        formaPago,
        productos,
        direccion,
        listaPedidos[codigo].fecha,
        listaPedidos[codigo].username
      );
      nuevoPedido.setEstado(listaPedidos[codigo].estado);
      listaPedidos[codigo] = nuevoPedido;

      res.status(HTTP_STATUS.Ok).json({ mensaje: "Pedido actualizado" });
    } else {
      res.status(HTTP_STATUS.Forbidden).json({ mensaje: "Autorización no valida" });
    }
  }
});

/*
 *Endpoints de medioDePagos
 */

/**
 * @swagger
 * /medioDePago:
 *  get:
 *    summary: "Retorna todos los medios de pagos"
 *    description: Retorna un array de objetos con los medios de pagos
 *    parameters: []
 *    produces:
 *      - "application/json"
 *    responses:
 *      "200":
 *        description: "successful operation"
 *        schema:
 *          type: "string"
 *          example: [{ "nombre": string, "descripcion": string, "icono": string }]
 */
server.get("/medioDePago", esLogin, (req, res) => {
  res.status(HTTP_STATUS.Ok).json(listaMedioDePagos);
});

/**
 * @swagger
 * /medioDePago:
 *  post:
 *    summary: "Crear un nuevo medioDePago"
 *    description: Crea un medioDePago en el sistema,no valida que el medioDePago  este repetido
 *    consumes:
 *      - "application/json"
 *    parameters:
 *    - name: body
 *      description: Objeto cuerpo de un medioDePago
 *      in: body
 *      required: true
 *      type: "string"
 *      example: {"nombre": string, "descripcion": string, "icono": string}
 *    produces:
 *      - "application/json"
 *    responses:
 *      "201":
 *        description: "MedioDePago creado"
 */

server.post("/medioDePago", esLogin, esAdmin, (req, res) => {
  let { nombre, descripcion, icono } = req.body;

  let nuevoMedioDePago = new MedioDePago(nombre, descripcion, icono);
  let codigoCreado = listaMedioDePagos.push(nuevoMedioDePago);

  res
    .status(HTTP_STATUS.Created)
    .json({ codigo: codigoCreado - 1, mensaje: "Medio de pago creado" });
});
/**
 * @swagger
 * /medioDePago/:codigo:
 *  put:
 *    summary: "Modifica un medio de pago"
 *    description: Modifica un medio de pago en el sistema, valida que el username o email no esté duplicado
 *    consumes:
 *      - "application/json"
 *    parameters:
 *    - name: "codigo"
 *      in: "path"
 *      description: "codigo del medio de pago a actualizar"
 *      required: true
 *      type: "string"
 *    - name: body
 *      description: Objeto cuerpo de un medio de pago
 *      in: body
 *      required: true
 *      type: "string"
 *      example: { "nombre": string, "descripcion": string, "icono": string }
 *    produces:
 *      - "application/json"
 *    responses:
 *      "200":
 *        description: " medio de pago modificado"
 *      "404":
 *        description: "Medio de pago no encontrado"
 */
server.put("/medioDePago/:codigo", esLogin, esAdmin, validoIdMedioPago, (req, res) => {
  let { codigo } = req.params;
  let { nombre, descripcion, icono } = req.body;

  let nuevoMedioDePago = new MedioDePago(nombre, descripcion, icono);
  listaMedioDePagos[codigo] = nuevoMedioDePago;

  res.status(HTTP_STATUS.Ok).json({ mensaje: "Medio de pago actualizado" });
});

/**
 * @swagger
 * /medioDePago/:codigo:
 *  delete:
 *    summary: "Elimina un medio de pago"
 *    description: Elimina un medio de pago en el sistema
 *    consumes:
 *      - "application/json"
 *    parameters:
 *    - name: "codigo"
 *      in: "path"
 *      description: "codigo del medio de pago a eliminar"
 *      required: true
 *      type: "string"
 *    - name: body
 *      description: Objeto cuerpo de un medio de pago
 *      in: body
 *      required: true
 *      type: "string"
 *      example: { "nombre": string, "descripcion": string, "icono": string }
 *    produces:
 *      - "application/json"
 *    responses:
 *      "200":
 *        description: "Medio de pago eliminado"
 *      "404":
 *        description: "Medio de pago no encontrado"
 */
server.delete("/medioDePago/:codigo", esLogin, esAdmin, validoIdMedioPago, (req, res) => {
  let { codigo } = req.params;

  listaMedioDePagos.splice(codigo, 1);

  res.status(HTTP_STATUS.Ok).json({ mensaje: "Medio de pago eliminado" });
});

server.listen(SERVER_PORT, () => {
  console.log(`Servidor backend Delilah en ejecución... ${SERVER_PORT}`);
});
