const express = require("express");
const server = express();
const PORT = 3000;

server.use(express.json());

server.get("/usuarios", (req, res) => {
  res.send("Aca devolvemos todos los usuarios");
});

server.post("/usuarios", (req, res) => {
  console.log(req.body);
  res.json({ mensaje: "usuario insertado" });
});

server.put("/usuarios/:indice", (req, res) => {
  //personas[parseInt(req.params.indice)] = req.body;
  res.json({ mensaje: "Actualizamos el usuario" });
});

server.delete("/usuarios/:indice", (req, res) => {
  res.send("Usuario eliminado");
});

server.get("/productos", (req, res) => {
  res.send("Aca devolvemos todos los productos");
});

server.post("/productos", (req, res) => {
  console.log(req.body);
  res.json({ mensaje: "producto insertado" });
});

server.put("/productos/:indice", (req, res) => {
  //personas[parseInt(req.params.indice)] = req.body;
  res.json({ mensaje: "Actualizamos el producto" });
});

server.delete("/productos/:indice", (req, res) => {
  res.send("Producto eliminado");
});

server.get("/pedidos", (req, res) => {
  res.send("Aca devolvemos todos los pedidos");
});

server.post("/pedidos", (req, res) => {
  console.log(req.body);
  console.log(req.headers.id_usuario);

  res.json({ mensaje: "pedido insertado" });
});

server.put("/pedidos/:indice", (req, res) => {
  //personas[parseInt(req.params.indice)] = req.body;
  res.json({ mensaje: "Actualizamos el pedido" });
});

server.delete("/pedidos/:indice", (req, res) => {
  res.send("Pedido eliminado");
});

server.listen(PORT, () => {
  console.log(`Servidor backend Delilah en ejecución... ${PORT}`);
});
