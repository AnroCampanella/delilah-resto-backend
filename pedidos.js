class Pedidos {
  constructor(formaPago, estado, productos, precioTotal, fecha, username) {
    this.formaPago = formaPago;
    this.estado = estado;
    this.productos = productos;
    this.precioTotal = precioTotal;
    this.fecha = fecha;
    this.username = username;
  }
}
module.exports = Pedidos;
