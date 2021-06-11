class Pedidos {
  constructor(formaPago, estado, detalle, precioTotal) {
    this.formaPago = formaPago;
    this.estado = estado;
    this.detalle = detalle;
    this.precioTotal = precioTotal;
  }
}
module.exports = Pedidos;
