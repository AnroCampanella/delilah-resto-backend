class Usuarios {
  constructor(
    nombre,
    apellido,
    email,
    direccion,
    telefono,
    username,
    clave,
    esAdmin
  ) {
    // el nombre y apellido los hice separados,
    // la pantalla de crear cuenta "page-1-sign-up.png" aparece todo junto,
    // pero en la pantalla "page-1-éxito.png" necesitamos el nombre solo sin apellido
    // hay incongruencia en los datos, por lo que opté por ponerlos separados
    this.nombre = nombre;
    this.apellido = apellido;
    this.email = email;
    this.direccion = direccion;
    this.telefono = telefono;
    this.username = username;
    this.clave = clave;
    this.esAdmin = esAdmin;
  }
}
module.exports = Usuarios;
