const {
  listaMedioDePagos,
  listaPedidos,
  listaProductos,
  listaUsuarios,
} = require("./structures");

const { HTTP_STATUS } = require("./constants");

// middleware local para verificar si el usuario está logueado
const esLogin = (req, res, next) => {
  let tokenDeLogin = parseInt(req.headers.token);

  // verifica que sea un usuario valido
  if (listaUsuarios[tokenDeLogin]) {
    let estaLogin = listaUsuarios[tokenDeLogin].estaLogin;

    if (estaLogin) {
      // actualiza el tokenDeLogin (parseInt) para siguientes middlewares
      req.headers.tokenDeLogin = tokenDeLogin;
      next();
    } else {
      res.status(HTTP_STATUS.Unauthorized).send({ mensaje: "Usuario no logueado" });
    }
  } else {
    res.status(HTTP_STATUS.Unauthorized).json({ mensaje: "Usuario no logueado" });
  }
};

// middleware local para verificar si el usuario es administrador
const esAdmin = (req, res, next) => {
  let { tokenDeLogin } = req.headers; // req.headers.tokenDeLogin lo validamos (pareseInt) en el middleware login

  let usuarioAdmin = listaUsuarios[tokenDeLogin].esAdmin;
  if (usuarioAdmin) {
    next();
  } else {
    res.status(HTTP_STATUS.Forbidden).send({ mensaje: "No es Administrador" });
  }
};

// middleware local para verificar si el usuario existe
const validoUsuario = (req, res, next) => {
  let usuarioId = req.params.usuarioId;

  let indice = listaUsuarios.findIndex((element, index) => {
    return element.username === usuarioId;
  });

  if (listaUsuarios[indice]) {
    req.params.indiceUsuario = indice; // agrego indice válido para poder usarlo en siguientes middleware
    next();
  } else {
    res.status(HTTP_STATUS.NotFound).json({ mensaje: "Usuario no encontrado" });
  }
};

// middleware local para verificar si el producto a modificar o eliminar existe
const validoIdProducto = (req, res, next) => {
  let codigo = parseInt(req.params.codigo);

  if (listaProductos[codigo]) {
    req.params.codigo = codigo; //req.params.codigo lo actualizo con (parseInt) para poder usarlo en los endpoint
    next();
  } else {
    res.status(HTTP_STATUS.NotFound).json({ mensaje: "Producto no encontrado" });
  }
};

// middleware local para verificar si el pedido a modificar o eliminar existe
const validoIdPedido = (req, res, next) => {
  let codigo = parseInt(req.params.codigo);

  if (listaPedidos[codigo]) {
    req.params.codigo = codigo; //req.params.codigo lo actualizo con (pareseInt) para poder usarlo en los endpoint
    next();
  } else {
    res.status(HTTP_STATUS.NotFound).json({ mensaje: "Pedido no encontrado" });
  }
};

// middleware local para verificar si el medioDePago a modificar o eliminar existe
const validoIdMedioPago = (req, res, next) => {
  let codigo = parseInt(req.params.codigo);

  if (listaMedioDePagos[codigo]) {
    req.params.codigo = codigo; //req.params.codigo lo actualizo con (parseInt) para poder usarlo en los endpoint
    next();
  } else {
    res.status(HTTP_STATUS.NotFound).json({ mensaje: "Medio de pago no encontrado" });
  }
};

module.exports = {
  esLogin,
  esAdmin,
  validoUsuario,
  validoIdProducto,
  validoIdPedido,
  validoIdMedioPago,
};
