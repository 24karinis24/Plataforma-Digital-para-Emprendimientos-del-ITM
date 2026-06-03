using ITM.Emprendimientos.Domain.Entities;
using ITM.Emprendimientos.Domain.Enums;

namespace ITM.Emprendimientos.Domain.Factories;

/// <summary>
/// Patrón: Factory Method
/// Crea instancias de usuario según el TipoUsuario solicitado.
/// El servicio de registro solo conoce la clase abstracta Usuario;
/// nunca instancia Emprendedor, Comprador o Administrador directamente.
/// Agregar un nuevo rol = crear una nueva subclase + registrarla aquí.
/// No requiere modificar el servicio de registro (OCP).
/// </summary>
public static class UsuariosFactory
{
    public static Usuario Crear(TipoUsuario tipo, string nombre, string email, string passwordHash)
    {
        return tipo switch
        {
            TipoUsuario.Emprendedor => new Emprendedor
            {
                Nombre = nombre,
                Email = email,
                PasswordHash = passwordHash
            },
            TipoUsuario.Comprador => new Comprador
            {
                Nombre = nombre,
                Email = email,
                PasswordHash = passwordHash
            },
            TipoUsuario.Administrador => new Administrador
            {
                Nombre = nombre,
                Email = email,
                PasswordHash = passwordHash
            },
            _ => throw new ArgumentException($"Tipo de usuario no soportado: {tipo}")
        };
    }
}
