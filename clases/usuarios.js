class Usuarios {
  constructor(nombreApellido, email, direccion, telefono, username, clave, esAdmin) {
    this.nombreApellido = nombreApellido;
    this.email = email;
    this.direccion = direccion;
    this.telefono = telefono;
    this.username = username;
    this.clave = clave;
    this.esAdmin = esAdmin; // a futuro poder agregar mas usuarios admin
    this.estaLogin = false;
  }

  setLogin() {
    this.estaLogin = true;
  }

  setLogoff() {
    this.estaLogin = false;
  }

  getDatos() {
    return {
      nombreApellido: this.nombreApellido,
      email: this.email,
      direccion: this.direccion,
      telefono: this.telefono,
      username: this.username,
    };
  }
}
module.exports = Usuarios;
