class Pedidos {
  constructor(formaPago, estado, productos, precioTotal) {
    this.formaPago = formaPago;
    this.estado = estado;
    this.productos = productos;
    this.precioTotal = precioTotal;
  }
}
module.exports = Pedidos;
