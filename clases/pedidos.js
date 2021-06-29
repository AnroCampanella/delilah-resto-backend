const { PEDIDOS_STATUS } = require("../constants");

class Pedidos {
  constructor(formaPago, productos, direccion, fecha, username) {
    this.formaPago = formaPago;
    this.estado = PEDIDOS_STATUS.Pendiente;
    this.productos = productos;
    this.direccion = direccion;
    this.fecha = fecha;
    this.username = username;
  }

  setEstado(nuevoEstado) {
    if (nuevoEstado in PEDIDOS_STATUS) {
      this.estado = nuevoEstado;
      return true;
    } else {
      return false;
    }
  }
}
module.exports = Pedidos;
